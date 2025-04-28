import { Controller, Get, Post, Req } from "@nestjs/common";
import { LogService } from "./log.service";

@Controller('log')
export class LogController {
    constructor(private readonly logService: LogService) { }

    @Get()
    async getLogs(){
        return this.logService.getAllLog();
    }
}