// src/reports/report.controller.ts
import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ReportService, TimeInterval } from './report.service';
import { Response } from 'express';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('generate')
  async generateReport(
    @Query('type') type: 'Mantenimiento' | 'Preventivo',
    @Query('interval') interval: TimeInterval,
    @Query('year') year: string,
    @Query('month') month: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    if (!type || !interval) {
      throw new BadRequestException(
        'Parámetros requeridos: type, interval',
      );
    }

    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedMonth = month ? parseInt(month, 10) : undefined;
    const parsedStart = startDate ? new Date(startDate) : undefined;
    const parsedEnd = endDate ? new Date(endDate) : undefined;

    return this.reportService.generateReport(
      type,
      interval,
      res,
      parsedYear,
      parsedStart,
      parsedEnd,
      parsedMonth,
    );
  }
}
