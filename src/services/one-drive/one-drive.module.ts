import { Module } from "@nestjs/common";
import { HistoryModule } from "src/components/history/history.module";
import { LogModule } from "src/components/log/log.module";
import { OneDriveController } from "./one-drive.crontoller";
import { OneDriveService } from "./one-drive.service";

@Module({
    imports: [
        LogModule,
        HistoryModule,
    ],
    controllers: [
        OneDriveController
    ],
    providers: [
        OneDriveService
    ]
})
export class OneDriveModule{}