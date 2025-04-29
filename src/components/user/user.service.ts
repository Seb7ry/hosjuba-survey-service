import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { poolPromise } from "src/configurations/sql-server/sql.configuration";
import * as dotenv from 'dotenv';
import { LogService } from "../log/log.service";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./user.model";
import { Model } from 'mongoose';
import { Request } from "express";
import { HistoryService } from "../history/history.service";
dotenv.config();

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly logService: LogService,
        private readonly historyService: HistoryService
    ){ }

    async findUserByUsername(username: string): Promise<User | null> {
        try {
            const user = await this.userModel.findOne({ username }).exec();
            return user;
        } catch (e) {
            throw new Error(`Error al encontrar el usuario: ${e.message}`);
        }
    }    

    async createUser(req: Request, username: string, password: string, name: string, department: string, position: string) {
        try {
            if (!username || !password || !name || !department || !position) {
                throw new HttpException('Se requieren todos los datos para crear el log.', HttpStatus.BAD_REQUEST);
            }
    
            const existingUser = await this.findUserByUsername(username);
            if (existingUser) {
                throw new HttpException('El nombre de usuario ya está en uso.', HttpStatus.BAD_REQUEST);
            }
    
            const user = new this.userModel({ _id: username, username, password, name, department, position });
            await this.historyService.createHistory(
                `${req.body.username}`,
                `Se ha creado el usuario ${username}.`
            );

            return await user.save();
        } catch (e) {
            await this.logService.createLog(
                'error',
                'user.service.ts',
                'createUser',
                `Error al crear un usuario: ${e.message}`
            );
            throw new InternalServerErrorException(`Error al crear un usuario: `, e.message);
        }
    }    
}