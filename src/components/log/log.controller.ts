import { Controller, Get, Query, Req } from "@nestjs/common";
import { LogService } from "./log.service";
import { Request } from "express";

@Controller('log')
export class LogController {
    constructor(private readonly logService: LogService) { }

    @Get()
    async getLogs(){
        return this.logService.getAllLog();
    }

    @Get('filter')
    async getLogFilter(
        @Query('level') level: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Req() req: Request,
    ) {
        return this.logService.getLogFilter(req, level, startDate, endDate);
    }
}