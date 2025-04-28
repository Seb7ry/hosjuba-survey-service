import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import * as dotenv from 'dotenv';
import { SessionModule } from "../session/session.module";
import { HistoryModule } from "../history/history.module";
dotenv.config();

@Module({
    imports: [
        UserModule,
        ConfigModule,
        HistoryModule,
        SessionModule,
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}