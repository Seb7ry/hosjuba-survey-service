import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { HistoryService } from "../history/history.service";
import { SessionService } from "../session/session.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import * as dotenv from 'dotenv';
import * as ms from 'ms';
import { LogService } from "../log/log.service";

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
        try{
            const user = await this.userService.findByUserName(username);
            if (!password || user.password !== password) {
                await this.logService.createLog('warning', 'auth.service.ts', 'login', 'Contraseña incorrecta.');
                throw new HttpException('Credenciales inválidas.', HttpStatus.BAD_REQUEST);
            }
    
            const payloado = { username: user.username, sub: user.id, groupp: user.groupp,};
            const expiresIn = process.env.JWT_EXPIRATION || '1h'; ;
            const token = this.jwtService.sign(payloado,{
                secret: process.env.JWT_SECRET,
                expiresIn,
            });
    
            const expirationTime = ms(expiresIn);
            const expiredDateAt = new Date(Date.now() + expirationTime);
    
            await this.sessionService.createSession(token, user.username, user.groupp, expiredDateAt);
            await this.historyService.createHistory(
                `${req.body.username}`,
                'El usuario ha iniciado sesión.');
        
            return {
                username: user.username,
                groupp: user.groupp,
                access_token: token,
                expiredDateAt: expiredDateAt.toISOString(), 
            };
        } catch (e) {
        }        
    }

    async logout(req: Request, username: string) {
        await this.historyService.createHistory(
            `${req.body.username}`, 
            'El usuario ha cerrado sesión.');
            
        return await this.sessionService.deleteSession(username);
    }
}