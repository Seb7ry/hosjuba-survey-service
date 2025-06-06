import { Injectable } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { Request, Response } from 'express';
import { CaseService } from '../case/case.service';
import * as moment from 'moment';
import { CorrectiveReport } from './formats/corrective.report';
import { PreventiveReport } from './formats/preventive.report';
import { HistoryService } from '../history/history.service';

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
        private readonly preventiveReport: PreventiveReport,
        private readonly historyService: HistoryService,
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
                if (month == null || month < 1 || month > 2) {
                    throw new Error('Para intervalo semestral, el mes debe ser 1 (primer semestre) o 2 (segundo semestre)');
                }
                return {
                    start: moment(`${currentYear}-${month === 1 ? '01' : '07'}-01`).startOf('day').toDate(),
                    end: moment(`${currentYear}-${month === 1 ? '06' : '12'}-${month === 1 ? '30' : '31'}`).endOf('day').toDate(),
                };

            case 'trimestral':
                if (month == null || month < 1 || month > 4) {
                    throw new Error('Para intervalo trimestral, el mes debe ser un trimestre válido (1-4)');
                }
                const startMonth = (month - 1) * 3;
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
        req: Request,
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

        const reportLabel = type === 'Mantenimiento' ? 'Correctivo' : 'Preventivo';

        await this.historyService.createHistory(
            req.user?.username || 'Desconocido',
            `Generó un reporte ${reportLabel} con intervalo "${interval}" desde ${moment(start).format('DD/MM/YY')} hasta ${moment(end).format('DD/MM/YY')}.`
        );

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