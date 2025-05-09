import { Module } from "@nestjs/common";
import { HistoryModule } from "../history/history.module";
import { SessionModule } from "../session/session.module";
import { MongooseModule } from "@nestjs/mongoose";
import { Position, PositionSchema } from "./position.model";
import { JwtModule } from "@nestjs/jwt";
import { PositionController } from "./position.controller";
import { PositionService } from "./position.service";

@Module({
    imports: [
        HistoryModule,
        SessionModule,
        MongooseModule.forFeature([
            { name: Position.name, schema: PositionSchema },
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
    controllers: [PositionController],
    providers: [PositionService],
    exports: [PositionService]
})
export class PositionModule {}