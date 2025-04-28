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

    async findByUserNameSQL(username: string) {
        try {
            if (!username || username.trim() === '') {
                throw new HttpException('El nombre de usuario es requerido.', HttpStatus.BAD_REQUEST);
            }            

            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('username', username)
                .query(`
                    SELECT 
                    LTRIM(RTRIM(dbo.desencriptar(AUsrId))) AS username, 
                    LTRIM(RTRIM(dbo.desencriptar(AUsrDsc))) AS name, 
                    LTRIM(RTRIM(dbo.desencriptar(AUsrPsw))) AS password, 
                    LTRIM(RTRIM(AgrpId)) AS groupp
                    FROM ADMUSR 
                    WHERE dbo.desencriptar(AUsrId) = @username
                    AND AUsrEst <> 'N'
                `);
            
            if(result.recordset.length === 0) {
                await this.logService.createLog('warning', 'user.service.ts', 'findByUserName', `Usuario ${username} no encontrado`);
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }   
            
            return result.recordset[0];
        } catch(e) {
            await this.logService.createLog('error', 'user.service.ts', 'findByUserName', `Error buscando usuario: ${e.message}`);
            throw new HttpException(`Error buscando usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createUser(
        req: Request,
        username: string,
        password: string,
        name: string,
        department: string,
        position: string
    ){
        try{
            if(!username || !password || !name || !department || !position){
                throw new HttpException('Se requieren todos los datos para crear el log.', HttpStatus.BAD_REQUEST);
            }

            const user = new this.userModel({
                username,
                password,
                name,
                department,
                position,
            });

            await this.historyService.createHistory(
                `${req.body.username}`,
                `Se ha creado el usuario ${username}.`
            );

            return user.save();
        } catch(e) {
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