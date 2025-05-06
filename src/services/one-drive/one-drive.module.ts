import { Module } from "@nestjs/common";
import { HistoryModule } from "src/components/history/history.module";
import { LogModule } from "src/components/log/log.module";
import { OneDriveController } from "./one-drive.controller";
import { OneDriveService } from "./one-drive.service";
import { JwtModule } from "@nestjs/jwt";
import { SessionModule } from "src/components/session/session.module";

@Module({
    imports: [
        LogModule,
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
    controllers: [
        OneDriveController
    ],
    providers: [
        OneDriveService
    ]
})
export class OneDriveModule { }