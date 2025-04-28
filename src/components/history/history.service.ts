import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { History, HistoryDocument } from "./history.model";
import { Model } from "mongoose";

import * as ms from 'ms';
import * as dotenv from 'dotenv';
import { Request } from "express";
dotenv.config();

@Injectable()
export class HistoryService {
    constructor(@InjectModel(History.name) private historyModel: Model<HistoryDocument>){ }

    async createHistory(
        username: string,
        message: string
    ) {
        const expirationTime = ms(process.env.RECORD_TIME_EXPIRATION);
        const history = new this.historyModel({
            timestamp: new Date(Date.now()),
            expirationDate: new Date(Date.now() + expirationTime),
            username,
            message,
        });
        
        return history.save();
    }

    async getAllHistory() {
        return this.historyModel.find().exec();
    }

    async getHistoryFilter(
        req: Request,
        username?: string,
        startDate?: string,
        endDate?: string
    ) {
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            throw new Error('La fecha inicial no puede ser posterior a la fecha final.');
        }
    
        const filter: any = {};
        let text = 'Filtros:';
    
        if (username) {
            filter.username = username;
            text += ` usuario: ${username}`;
        }

        if (startDate && !endDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0); 
            filter.timestamp = { $gte: start };

            const end = new Date(startDate);
            end.setUTCHours(23, 59, 59, 999); 
            filter.timestamp.$lte = end;

            text += ` fecha inicial: ${startDate}`;
        }
    
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setUTCHours(0, 0, 0, 0);
            filter.timestamp = { $gte: start };
    
            const end = new Date(endDate);
            end.setUTCHours(23, 59, 59, 999); 
            filter.timestamp.$lte = end;

            text += ` fecha inicial: ${startDate} fecha final: ${endDate}`;
        }  

        this.createHistory(
            `${req.body.username}`, 
            `El usuario buscó un registro en el historial. ` + text + '.');
    
        return this.historyModel.find(filter).exec();
    }    
}