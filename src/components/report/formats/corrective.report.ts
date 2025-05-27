
import { Injectable } from '@nestjs/common';
import { Workbook, Worksheet, Column } from 'exceljs';
import * as moment from 'moment';

const ratingMap = {
    1: 'Malo',
    2: 'Regular',
    3: 'Bueno',
    4: 'Excelente'
};


@Injectable()
export class CorrectiveReport {



    generate(workbook: Workbook, cases: any[]): Worksheet {
        const worksheet = workbook.addWorksheet('Reporte Correctivo');

        worksheet.columns = [
            { header: 'Número de caso', key: 'caseNumber' },
            { header: 'Fecha y hora del reporte', key: 'reportedAt' },
            { header: 'Fecha y hora de atención', key: 'attendedAt' },
            { header: 'Fecha y hora de solución', key: 'solvedAt' },
            { header: 'N°/Nombre de equipo', key: 'equipmentName' },
            { header: 'N° de placa', key: 'plateNumber' },
            { header: 'Dependencia/Servicio', key: 'dependency' },
            { header: 'Funcionario', key: 'reportedByName' },
            { header: 'Cargo', key: 'position' },
            { header: 'Tipo de servicio', key: 'typeService' },
            { header: 'Técnico', key: 'technicianName' },
            { header: 'Cargo técnico', key: 'technicianPosition' },
            { header: 'Nivel de servicio', key: 'levelService' },
            { header: 'Prioridad', key: 'priority' },
            { header: 'Categoría', key: 'category' },
            { header: 'Calificación de efectividad', key: 'effectivenessRating' },
            { header: 'Calificación de atención', key: 'satisfactionRating' },
            { header: 'Estado', key: 'status' },
            { header: 'Tipo de escalamiento', key: 'levelEscalation' },
            { header: 'Técnico o área de escalamiento', key: 'technicianEscalationName' },
            { header: 'Diagnóstico', key: 'diagnosis' },
            { header: 'Solución', key: 'solution' },
            { header: 'Entrega documento firmado', key: 'documentDelivered' },
        ];

        cases.forEach(c => {
            worksheet.addRow({
                caseNumber: c.caseNumber,
                reportedAt: moment(c.reportedAt).format('YYYY-MM-DD HH:mm'),
                attendedAt: c.attendedAt ? moment(c.attendedAt).format('YYYY-MM-DD HH:mm') : 'N/A',
                solvedAt: c.solvedAt ? moment(c.solvedAt).format('YYYY-MM-DD HH:mm') : 'N/A',
                equipmentName: c.serviceData?.equipments?.[0]?.name || c.serviceData?.name || 'N/A',
                plateNumber: c.serviceData?.equipments?.[0]?.inventoryNumber || c.serviceData?.numberInventory || 'N/A',
                dependency: c.dependency || 'N/A',
                reportedByName: c.reportedBy?.name || 'N/A',
                position: c.reportedBy?.position || 'N/A',
                typeService: c.serviceType || 'N/A',
                technicianName: c.assignedTechnician?.name || 'N/A',
                technicianPosition: c.assignedTechnician?.position || 'N/A',
                levelService: c.serviceData?.level   || 'N/A',
                priority: c.serviceData?.priority || 'N/A',
                category: c.serviceData?.category || 'N/A',
                effectivenessRating: ratingMap[c.effectivenessRating.value] || 'N/A',
                satisfactionRating: ratingMap[c.satisfactionRating.value] || 'N/A',
                status: c.status || 'N/A',
                levelEscalation: c.serviceData?.escalationTechnician?.level || 'N/A',
                technicianEscalationName: c.serviceData?.escalationTechnician?.name || 'N/A',
                diagnosis: c.serviceData?.diagnosis || 'N/A',
                solution: c.serviceData?.solution || 'N/A',
                documentDelivered:
                    c.reportedBy?.signature?.trim() &&
                        c.ratings?.effectiveness &&
                        c.ratings?.satisfaction
                        ? 'Entregado'
                        : 'No entregado',
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
