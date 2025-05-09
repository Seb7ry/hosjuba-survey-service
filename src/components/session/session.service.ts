import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from 'mongoose';
import { Session, SessionDocument } from './session.model';
import * as ms from 'ms';

@Injectable()
export class SessionService {
    constructor(
        @InjectModel(Session.name) private sessionModel: Model<SessionDocument>) { }

    async findSession(username: string) {
        try {
            const session = await this.sessionModel.findOne({ _id: username }).exec();
            if (!session) {
                throw new HttpException('El usuario no tiene sesión activa.', HttpStatus.NOT_FOUND);
            }
            return session;
        } catch (e) {
            throw new HttpException(`Error al obtener la sesión del usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createSession(accessToken: string, username: string, name: string, position: string, department: string, expiredDateAt: Date) {
        try {
            if (!accessToken || !username || !name || !department || !position || !expiredDateAt) {
                throw new HttpException('Todos los campos son obligatorios para crear una sesión.', HttpStatus.BAD_REQUEST);
            }

            const session = await this.sessionModel.findOneAndUpdate(
                { _id: username },
                {
                    username,
                    name,
                    accessToken,
                    position,
                    department,
                    expiredDateAt
                },
                {
                    new: true,
                    upsert: true
                });

            return session;
        } catch (e) {
            throw new HttpException(`Error al crear la sesión del usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteSession(username: string) {
        try {
            const result = await this.sessionModel.deleteOne({ _id: username });
            if (result.deletedCount === 0) {
                throw new HttpException('No se encontró la sesión del usuario para eliminar.', HttpStatus.NOT_FOUND);
            }
            return { message: 'Sesión eliminada correctamente' };
        } catch (e) {
            throw new HttpException(`Error al eliminar la sesión del usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async refreshSession(username: string) {
        try {
            if (!username) throw new HttpException('Username es requerido.', HttpStatus.BAD_REQUEST);
            
            const exists = await this.sessionModel.findOne({ _id: username }).lean();
            const expirationTime = ms(process.env.JWT_EXPIRATION);
            const expiredDateAt = new Date(Date.now() + expirationTime);
            const session = await this.sessionModel.findOneAndUpdate(
                { _id: username },
                {
                    expiredDateAt: expiredDateAt,
                },
                {
                    new: true,
                    upsert: false
                });

            if (!session) throw new HttpException('Sesión no encontrada', HttpStatus.NOT_FOUND);
            
            return session;
        } catch (error) {
            throw new HttpException(`Error refrescando sesión: ${error.message}`, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
