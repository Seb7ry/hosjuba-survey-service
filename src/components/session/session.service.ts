import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.model';

@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>){ }
    
    async findSession(username: string) {
        return this.sessionModel.findOne({ _id: username }).exec();
    }

    async createSession(accessToken: string, username: string, groupp: string, expiredDateAt: Date) {
        const session = await this.sessionModel.findOneAndUpdate(
            { _id: username }, 
            { 
                username, 
                accessToken, 
                groupp, 
                expiredDateAt 
            },{ 
                new: true,  
                upsert: true 
            });
        return session;
    }
    
    async deleteSession(username: string) {
        const result = await this.sessionModel.deleteOne({ _id: username });
        if (result.deletedCount === 0) {
            throw new Error(`No session found for username: ${username}`);
        }
        return { message: 'Sesión eliminada correctamente' };
    }
}
