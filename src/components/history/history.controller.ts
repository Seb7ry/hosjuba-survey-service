import { Controller, Get, Query, Req } from "@nestjs/common";
import { Request } from "express";
import { HistoryService } from "./history.service";

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Get()
    async getHistory(){
        return this.historyService.getAllHistory();
    }

    @Get('filter')
    async getHistoryFilter(
        @Query('username') username: string,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Req() req: Request,
    ) {
        return this.historyService.getHistoryFilter(req, username, startDate, endDate);    
    }
}