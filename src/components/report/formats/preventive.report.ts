import { Injectable } from "@nestjs/common";
import { Workbook, Worksheet } from "exceljs";
import * as moment from 'moment';

const ratingMap = {
    1: 'Malo',
    2: 'Regular',
    3: 'Bueno',
    4: 'Excelente'
};

@Injectable()
export class PreventiveReport {
    generate(workbook: Workbook, cases: any[]): Worksheet {
        const worksheet = workbook.addWorksheet('Reporte Preventivo');

        worksheet.columns = [
            { header: 'Número de caso', key: 'caseNumber' },
            { header: 'Fecha del reporte', key: 'reportedAt' },
            { header: 'N°/Nombre de equipo', key: 'equipmentName' },
            { header: 'Dependencia/Servicio', key: 'dependency' },
            { header: 'Ubicación', key: 'location' },
            { header: 'Funcionario', key: 'reportedByName' },
            { header: 'Cargo', key: 'position' },
            { header: 'Técnico', key: 'technicianName' },
            { header: 'Cargo técnico', key: 'technicianPosition' },
            { header: 'Calificación de atención', key: 'satisfactionRating' },
            { header: 'Estado', key: 'status' },
        ]

        cases.forEach(c => {
            worksheet.addRow({
                caseNumber: c.caseNumber,
                reportedAt: moment(c.reportedAt).format('YYYY-MM-DD HH:mm'),
                equipmentName: c.serviceData?.name || 'N/A',
                dependency: c.dependency || 'N/A',
                location: c.serviceData?.location || 'N/A',
                reportedByName: c.reportedBy?.name || 'N/A',
                position: c.reportedBy?.position || 'N/A',
                technicianName: c.assignedTechnician?.name || 'N/A',
                technicianPosition: c.assignedTechnician?.position || 'N/A',
                satisfactionRating: ratingMap[c.satisfactionRating.value] || 'N/A',
                status: c.status
            });
        });

        worksheet.columns.forEach(column => {
            const header = column.header as string;
            let maxLength = header.length;

            worksheet.eachRow((row) => {
                const cell = row.getCell(column.key as string);
                const cellValue = cell.value;
                const length = typeof cellValue === 'string' ? cellValue.length : (cellValue?.toString().length || 0);
                if (length > maxLength) {
                    maxLength = length;
                }
            });

            column.width = maxLength + 2;
        });

        const headerRow = worksheet.getRow(1);
        headerRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'a9d18e' }
            }
        })

        return worksheet;
    }
}