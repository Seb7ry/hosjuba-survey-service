import { Module } from "@nestjs/common";
import { GoogleDriveController } from "./google-drive.controller";
import { GoogleDriveService } from "./google-drive.service";
import { LogModule } from "src/components/log/log.module";

@Module({
    imports: [LogModule],
    controllers: [GoogleDriveController],
    providers: [GoogleDriveService],
})
export class GoogleDriveModule {}