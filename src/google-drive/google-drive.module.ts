import { Module } from "@nestjs/common";
import { DriveController } from "./google-drive.controller";
import { DriveService } from "./google-drive.service";

@Module({
    controllers: [DriveController],
    providers: [DriveService],
})
export class DriveModule {}