import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { LogModule } from "../log/log.module";
import { HistoryModule } from "../history/history.module";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { User, UserSchema } from "./user.model";
import { SessionModule } from "../session/session.module";

@Module({
    imports: [
        LogModule,
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
        }),    
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {}