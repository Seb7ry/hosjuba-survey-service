import { Module, forwardRef } from "@nestjs/common";
import { Log, LogSchema } from "./log.model";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { LogController } from "./log.controller";
import { LogService } from "./log.service";
import { HistoryModule } from "../history/history.module";

@Module({
    imports: [
        forwardRef(() => HistoryModule),
        MongooseModule.forFeature([
                    { name: Log.name, schema: LogSchema },
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
        LogController
    ],
    providers: [
        LogService
    ],
    exports: [
        LogService
    ]
})
export class LogModule{}