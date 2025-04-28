import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { HistoryService } from "./history.service";
import { HistoryController } from "./history.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { History, HistorySchema } from "./history.model";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: History.name, schema: HistorySchema },
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
    controllers: [
        HistoryController
    ],
    providers: [
        HistoryService
    ],
    exports: [
        HistoryService
    ]
})
export class HistoryModule{}