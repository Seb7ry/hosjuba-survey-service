import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { HistoryService } from "../history/history.service";
import { User, UserDocument } from "./user.model";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from 'mongoose';

import * as dotenv from 'dotenv';
import { SessionService } from "../session/session.service";
dotenv.config();

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        private readonly historyService: HistoryService,
        private readonly sessionService: SessionService
    ) { }

    async onModuleInit() {
        try {
            const adminUsername = process.env.ADMIN_USERNAME;
            const adminPassword = process.env.ADMIN_PASSWORD;
            const adminName = process.env.ADMIN_NAME;
            const adminDepartment = process.env.ADMIN_DEPENDENCY;

            const adminExists = await this.userModel.findOne({ username: adminUsername });

            if (!adminExists) {
                const adminData: Partial<User> = {
                    _id: adminUsername,
                    username: adminUsername,
                    password: adminPassword,
                    name: adminName,
                    department: adminDepartment,
                    position: 'Administrador',
                };

                const adminUser = new this.userModel(adminData);
                await adminUser.save();
            }
        } catch (error) {
            throw new InternalServerErrorException('Error en la inicialización de servicio usuario.', error.message);
        }
    }

    async listUsers(): Promise<User[]> {
        try {
            const users = await this.userModel.find().exec();
            return users;
        } catch (e) {
            throw new InternalServerErrorException('Error al listar usuarios.', e.message);
        }
    }

    async findUserByUsername(username: string): Promise<User | null> {
        try {
            const user = await this.userModel.findOne({ username }).exec();
            if (!user) throw new HttpException('El usuario no se encuentra.', HttpStatus.NOT_FOUND);
            return user;
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(`Error al encontrar el usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async createUser(
        req: Request,
        username: string,
        password: string,
        name: string,
        department: string,
        position: string,
        signature?: string
    ) {
        try {
            if (!username || !password || !name || !department || !position) {
                throw new HttpException('Se requieren todos los datos para crear el usuario.', HttpStatus.BAD_REQUEST);
            }

            const existingUser = await this.userModel.findOne({ username }).exec();
            if (existingUser) throw new HttpException('El nombre de usuario ya está en uso.', HttpStatus.BAD_REQUEST);

            const userData: Partial<User> = {
                _id: username,
                username,
                password,
                name,
                department,
                position,
            };

            if (signature) {
                userData.signature = signature;
            }

            const user = new this.userModel(userData);
            //await this.historyService.createHistory(req.body.username, `Se ha creado el usuario ${username}.`);
            return await user.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al crear un usuario.', e.message);
        }
    }

    async updateUser(
        req: Request,
        data: Partial<User> & { username: string }
    ) {
        try {
            const { username, ...updates } = data;

            const user = await this.userModel.findOne({ username }).exec();
            if (!user) throw new HttpException('El usuario no existe.', HttpStatus.NOT_FOUND);

            if (updates.name !== undefined) user.name = updates.name;
            if (updates.department !== undefined) user.department = updates.department;
            if (updates.position !== undefined) user.position = updates.position;
            if (updates.password !== undefined) user.password = updates.password;
            if (updates.signature !== undefined) user.signature = updates.signature;

            return await user.save();
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al actualizar el usuario.', e.message);
        }
    }


    async deleteUser(req: Request, username: string) {
        try {
            if (!username) throw new HttpException('Debe proporcionar un nombre de usuario.', HttpStatus.BAD_REQUEST);
            if (username.toLowerCase() === 'admin') throw new HttpException('No se puede eliminar al usuario administrador.', HttpStatus.FORBIDDEN);

            const user = await this.userModel.findOne({ username }).exec();
            if (!user) throw new HttpException('El usuario no existe.', HttpStatus.NOT_FOUND);

            await this.userModel.deleteOne({ _id: username }).exec();

            //await this.historyService.createHistory(
            //    req.body.username,
            //    `Se ha eliminado el usuario ${username}.`
            //);

            return { message: 'Usuario eliminado correctamente.' };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new InternalServerErrorException('Error al eliminar el usuario.', e.message);
        }
    }
}