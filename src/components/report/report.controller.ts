import {
  Controller,
  Get,
  Query,
  Res,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReportService, TimeInterval } from './report.service';
import { Request, Response } from 'express';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) { }

  @Get('generate')
  @UseGuards(AuthGuard)
  async generateReport(
    @Req() req: Request,
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
      req,
      parsedYear,
      parsedStart,
      parsedEnd,
      parsedMonth,
    );
  }
}
