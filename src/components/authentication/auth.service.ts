import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HistoryService } from "../history/history.service";
import { SessionService } from "../session/session.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import * as ms from 'ms';
import * as bcrypt from 'bcryptjs';
import { LogService } from "../log/log.service";

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
    constructor(
        private readonly logService: LogService,
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly historyService: HistoryService,
        private readonly sessionService: SessionService,
    ) { }

    async login(req: Request, username: string, password: string) {
        try {
            const user = await this.userService.findUserByUsername(username);
   
            if (!user) {
                await this.logService.createLog('warning', 'auth.service.ts', 'login', 'Usuario no encontrado.');
                throw new HttpException('Usuario no encontrado.', HttpStatus.BAD_REQUEST);
            }
   
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                await this.logService.createLog('warning', 'auth.service.ts', 'login', 'Contraseña incorrecta.');
                throw new HttpException('Contraseña incorrecta.', HttpStatus.BAD_REQUEST);
            }
            const payloado = { username: user.username, sub: user._id, position: user.position };
            const expiresIn = process.env.JWT_EXPIRATION || '1h';
            const token = this.jwtService.sign(payloado, {
                secret: process.env.JWT_SECRET,
                expiresIn,
            });
   
            const expirationTime = ms(expiresIn);
            const expiredDateAt = new Date(Date.now() + expirationTime);
   
            await this.sessionService.createSession(token, user.username, user.name, user.position, user.department, expiredDateAt);
            await this.historyService.createHistory(`${req.body.username}`, 'El usuario ha iniciado sesión.');
   
            return {
                username: user.username,
                name: user.name,
                position: user.position,
                department: user.department,
                access_token: token,
                expiredDateAt: expiredDateAt.toISOString(),
            };
        } catch (e) {
            if (e instanceof HttpException) throw e;
            throw new HttpException(`Error en el login: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    } 

    async logout(req: Request, username: string) {
        await this.historyService.createHistory(
            `${req.body.username}`, 
            'El usuario ha cerrado sesión.');
            
        return await this.sessionService.deleteSession(username);
    }
}