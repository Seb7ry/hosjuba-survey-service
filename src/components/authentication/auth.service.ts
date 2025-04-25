import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { SessionService } from "../session/session.service";
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as dotenv from 'dotenv';
import * as ms from 'ms';

dotenv.config();

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly sessionService: SessionService
    ) { }

    async login(username: string, password: string) {
        const user = await this.userService.findByUserName(username);
        if (!password || user.password !== password) {
            throw new HttpException('Credenciales inválidas.', HttpStatus.BAD_REQUEST);
        }

        const payloado = { username: user.username, sub: user.id };
        const expiresIn = process.env.JWT_EXPIRATION;
        const token = this.jwtService.sign(payloado, {
            secret: process.env.JWT_SECRET,
            expiresIn,
        });

        const expiredDateAt = new Date(Date.now() + ms(expiresIn));

        await this.sessionService.createSession(token, user.username, user.groupp, expiredDateAt);

        return {
            username: user.username,
            groupp: user.groupp,
            access_token: token,
            expiredDateAt: expiredDateAt.toISOString(), 
        };
    }

    async logout(username: string) {
        return await this.sessionService.deleteSession(username);
    }
}