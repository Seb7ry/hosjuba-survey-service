import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Session, SessionSchema } from "./session.model";
import { SessionService } from "./session.service";
import { SessionController } from "./session.controller";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [
        MongooseModule.forFeature(
            [{ name: Session.name, schema: SessionSchema }]
        ), 
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET,
                signOptions: {
                    expiresIn: process.env.JWT_EXPIRATION,
                },
            }),
        }),
    ],
    controllers: [SessionController],
    providers: [SessionService],
    exports: [SessionService]
})
export class SessionModule { }