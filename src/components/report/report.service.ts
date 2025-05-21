import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Response } from 'express';
import { CaseService } from '../case/case.service';
import * as moment from 'moment';
import { CorrectiveReport } from './formats/corrective.report';
import { PreventiveReport } from './formats/preventive.report';

export type TimeInterval =
    | 'anual'
    | 'semestral'
    | 'trimestral'
    | 'mensual'
    | 'personalizado';

@Injectable()
export class ReportService {
    constructor(
        private readonly caseService: CaseService,
        private readonly correctiveReport: CorrectiveReport,
        private readonly preventiveReport: PreventiveReport
    ) { }

    private getDateRange(
        interval: TimeInterval,
        year?: number,
        startDate?: Date,
        endDate?: Date,
        month?: number,
    ) {
        const now = moment().tz('America/Bogota');
        const currentYear = year || now.year();

        switch (interval) {
            case 'anual':
                return {
                    start: moment(`${currentYear}-01-01`).startOf('day').toDate(),
                    end: moment(`${currentYear}-12-31`).endOf('day').toDate(),
                };
            case 'semestral':
                const semester = now.month() < 6 ? 1 : 2;
                return {
                    start: moment(`${currentYear}-${semester === 1 ? '01' : '07'}-01`).startOf('day').toDate(),
                    end: moment(`${currentYear}-${semester === 1 ? '06' : '12'}-${semester === 1 ? '30' : '31'}`).endOf('day').toDate(),
                };
            case 'trimestral':
                const quarter = Math.floor(now.month() / 3) + 1;
                const startMonth = (quarter - 1) * 3;
                return {
                    start: moment().year(currentYear).month(startMonth).startOf('month').toDate(),
                    end: moment().year(currentYear).month(startMonth + 2).endOf('month').endOf('day').toDate(),
                };
            case 'mensual':
                if (month == null) {
                    throw new Error('Para intervalo mensual se requiere el parámetro "month"');
                }
                return {
                    start: moment().year(currentYear).month(month - 1).startOf('month').toDate(),
                    end: moment().year(currentYear).month(month - 1).endOf('month').toDate(),
                };
            case 'personalizado':
                if (!startDate || !endDate) {
                    throw new Error('Para intervalo personalizado se requieren fechas de inicio y fin');
                }
                return {
                    start: moment(startDate).startOf('day').toDate(),
                    end: moment(endDate).endOf('day').toDate(),
                };
            default:
                throw new Error('Intervalo de tiempo no válido');
        }
    }

    async generateReport(
        type: 'Mantenimiento' | 'Preventivo',
        interval: TimeInterval,
        res: Response,
        year?: number,
        customStart?: Date,
        customEnd?: Date,
        month?: number,
    ) {
        const { start, end } = this.getDateRange(interval, year, customStart, customEnd, month);

        const cases = await this.caseService.search({
            startDate: start,
            endDate: end,
            typeCase: type,
        });

        return this.generateExcelReport(type, cases, res);
    }


    private async generateExcelReport(type: string, cases: any[], res: Response) {
        const workbook = new Workbook();
        const worksheet =
            type === 'Mantenimiento'
                ? this.correctiveReport.generate(workbook, cases)
                : this.preventiveReport.generate(workbook, cases)

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=Reporte_${type}.xlsx`,
        );

        await workbook.xlsx.write(res);
        res.end();
    }
}