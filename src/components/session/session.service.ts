import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.model';

@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>){ }

    async createSession(accessToken: string, username: string, groupp: string, expiredDateAt: Date) {
        const session = new this.sessionModel({ accessToken, username, groupp, expiredDateAt });
        return session.save();
    }

    async deleteSession(username: string) {
        return this.sessionModel.deleteOne({ username });
    }

}
