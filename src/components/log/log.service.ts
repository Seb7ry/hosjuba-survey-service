
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as ms from 'ms';
import { Log, LogDocument } from './log.model';
import { Model } from 'mongoose';
import { Request } from 'express';
import { HistoryService } from '../history/history.service';
dotenv.config();

@Injectable()
export class LogService {
    constructor(
        @InjectModel(Log.name) private logModel: Model<LogDocument>,
        private readonly historyService: HistoryService){ }

    async createLog(
        level: string,
        document: string,
        method: string,
        message: string
    ) {
        try {
            if(!level || !document || !method || !message ) throw new HttpException('Se requieren todos los datos para crear el log.', HttpStatus.BAD_REQUEST);
            
            const expirationTime = ms(process.env.LOG_TIME_EXPIRATION);
            const log = new this.logModel({
                level,
                timestamp: new Date(Date.now()),
                expirationDate: new Date(Date.now() + expirationTime),
                document,
                method,
                message,
            })
            return log.save();
        } catch (e) {
            throw new HttpException(`Error al crear el log: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getAllLog() {
        try{        
            return this.logModel.find().exec();
        } catch(e) {
            await this.createLog('error','log.service.ts','getAllLog',`Error al obtener la lista de logs: ${e.message}`);
            throw new HttpException(`Error al obtener la lista de logs: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    async getLogFilter(
        req: Request,
        level?: string,
        startDate?: string,
        endDate?: string,
    ){
        if(startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('La fecha inicial no puede ser posterior a la fecha final.');
        }

        const filter: any = {};
        let text = 'Filtros:';

        if(level){
            filter.level = level;
            text += ` nivel: ${level}`;
        }

        if(startDate && !endDate){
            const start = new Date(startDate);
            start.setUTCHours(0,0,0,0);
            filter.timestamp = { $gte: start };
        
            const end = new Date(startDate);
            end.setUTCHours(23,59,59,999);
            filter.timestamp.$lte = end;

            text += ` fecha inicial: ${startDate}`;
        }

        if(startDate && endDate){
            const start = new Date(startDate);
            start.setUTCHours(0,0,0,0);
            filter.timestamp = { $gte: start }

            const end = new Date(endDate);
            end.setUTCHours(23,59,59,999);
            filter.timestamp.$lte = end;

            text += ` fecha inicial: ${startDate} fecha final: ${endDate}.`;
        }
    
        await this.historyService.createHistory(
            `${req.body.username}`, 
            `El usuario buscó un registro del sistema. ` + text + '.'
        );
    }
}
