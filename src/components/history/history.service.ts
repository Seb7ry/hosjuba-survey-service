import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { HistoryDocument } from "./history.model";
import { Model } from "mongoose";

@Injectable()
export class HistoryService {
    constructor(@InjectModel(History.name) private historyModel: Model<HistoryDocument>){ }

    async createHistory(
        type: string,
        username: string,
        document: string,
        message: string
    ) {
        const history = new this.historyModel({
            type,
            timestamp: new Date(),
            username,
            document,
            message,
        });

        return history.save();
    }

    async getAllHistory() {
        return this.historyModel.find().exec()
    }
}