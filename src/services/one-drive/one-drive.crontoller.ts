import { Controller, Get } from "@nestjs/common";
import { OneDriveService } from "./one-drive.service";

@Controller('one-drive')
export class OneDriveController {
    constructor(private readonly oneDriveService: OneDriveService){ }

    @Get('list')
    async list(){
        return this.oneDriveService.listFiles();
    }
}