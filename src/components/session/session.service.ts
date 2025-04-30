import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.model';
import { LogService } from "../log/log.service";

@Injectable()
export class SessionService {
    constructor(
        private readonly logService: LogService,
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>){ }
    
    async findSession(username: string) {
        try {
            const session = await this.sessionModel.findOne({ _id: username }).exec();
            if (!session) {
                await this.logService.createLog(
                    'warning',
                    'session.service.ts',
                    'findSession',
                    `La sesión del usuario ${username} no fue encontrada.`);
                throw new HttpException('El usuario no tiene sesión activa.', HttpStatus.NOT_FOUND);
            }
            return session;
        } catch (e) {
            await this.logService.createLog(
                'error',
                'session.service.ts',
                'findSession',
                `Error al intentar encontrar la sesión del usuario ${username}: ${e.message}`);
            throw new HttpException(`Error al obtener la sesión del usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createSession(accessToken: string, username: string, position: string, department: string, expiredDateAt: Date) {
        try {
            if (!accessToken || !username || !position || !expiredDateAt) {
                await this.logService.createLog(
                    'warning',
                    'session.service.ts',
                    'createSession',
                    `Datos incompletos para crear la sesión del usuario ${username}`);
                throw new HttpException('Todos los campos son obligatorios para crear una sesión.', HttpStatus.BAD_REQUEST);
            }

            const session = await this.sessionModel.findOneAndUpdate(
                { _id: username }, 
                { 
                    username, 
                    accessToken, 
                    position,
                    department,
                    expiredDateAt 
                },
                { 
                    new: true,  
                    upsert: true 
                });

            await this.logService.createLog(
                'info',
                'session.service.ts',
                'createSession',
                `Sesión creada/actualizada para el usuario ${username}.`);

            return session;
        } catch (e) {
            await this.logService.createLog(
                'error',
                'session.service.ts',
                'createSession',
                `Error al crear la sesión del usuario ${username}: ${e.message}`);
            throw new HttpException(`Error al crear la sesión del usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    async deleteSession(username: string) {
        try {
            const result = await this.sessionModel.deleteOne({ _id: username });
            if (result.deletedCount === 0) {
                await this.logService.createLog(
                    'warning',
                    'session.service.ts',
                    'deleteSession',
                    `No se encontró ninguna sesión para el usuario ${username}.`);
                throw new HttpException('No se encontró la sesión del usuario para eliminar.', HttpStatus.NOT_FOUND);
            }
            await this.logService.createLog(
                'info',
                'session.service.ts',
                'deleteSession',
                `Sesión eliminada correctamente para el usuario ${username}.`);
            return { message: 'Sesión eliminada correctamente' };
        } catch (e) {
            await this.logService.createLog(
                'error',
                'session.service.ts',
                'deleteSession',
                `Error al eliminar la sesión del usuario ${username}: ${e.message}`);
            throw new HttpException(`Error al eliminar la sesión del usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}