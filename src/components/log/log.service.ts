
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as dotenv from 'dotenv';
import * as ms from 'ms';
import { Log, LogDocument } from './log.model';
import { Model } from 'mongoose';
dotenv.config();

@Injectable()
export class LogService {
    constructor(@InjectModel(Log.name) private logModel: Model<LogDocument>){ }

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
}
