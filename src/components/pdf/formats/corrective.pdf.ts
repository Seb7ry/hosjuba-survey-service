import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

function formatDateTime(dateInput: string | Date | undefined): string {
    if (!dateInput) return '';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}


export async function drawCorrectiveTemplate(pdfDoc: PDFDocument, data: any = {}): Promise<PDFDocument> {
    if (!data || typeof data !== 'object') {
        data = {};
    }

    const templatePath = path.join('src', 'assets', 'PA-GSI-GARI-R2.pdf');
    if (!fs.existsSync(templatePath)) throw new Error(`No se encontró la plantilla: ${templatePath}`);

    const templateBytes = fs.readFileSync(templatePath);
    const templateDoc = await PDFDocument.load(templateBytes);
    const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
    const page = pdfDoc.addPage(templatePage);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const draw = (
        text: any,
        x: number,
        y: number,
        fontSize: number = 8,
        bold: boolean = false,
        color = rgb(0, 0, 0),
        boxWidth: number = 200,
        boxHeight: number = fontSize + 4,
        align: 'left' | 'center' = 'left',
        debug: boolean = false,
    ) => {
        const displayText = text?.toString() || '';
        const fontToUse = bold ? fontBold : font;

        let adjustedFontSize = fontSize;
        let lines: string[] = [];

        const wrapText = (text: string, width: number, size: number): string[] => {
            const words = text.split(' ');
            const lines: string[] = [];
            let currentLine = words[0] || '';

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + ' ' + word;
                const testWidth = fontToUse.widthOfTextAtSize(testLine, size);

                if (testWidth <= width) {
                    currentLine = testLine;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);
            return lines;
        };

        let fits = false;
        while (!fits && adjustedFontSize >= 4) {
            lines = wrapText(displayText, boxWidth, adjustedFontSize);
            const lineHeight = fontToUse.heightAtSize(adjustedFontSize) * 1.2;
            const totalHeight = lines.length * lineHeight;

            if (totalHeight <= boxHeight) {
                fits = true;
            } else {
                adjustedFontSize -= 0.5;
            }
        }

        const lineHeight = fontToUse.heightAtSize(adjustedFontSize) * 1.2;
        const startY = y + boxHeight - lineHeight;

        lines.forEach((line, index) => {
            const lineY = startY - (index * lineHeight);
            if (lineY >= y) {
                let textX = x;
                if (align === 'center') {
                    const textWidth = fontToUse.widthOfTextAtSize(line, adjustedFontSize);
                    textX = x + (boxWidth - textWidth) / 2;
                }
                page.drawText(line, {
                    x: textX,
                    y: lineY,
                    size: adjustedFontSize,
                    font: fontToUse,
                    color,
                    maxWidth: boxWidth
                });
            }
        });

        if (debug) {
            page.drawRectangle({
                x,
                y,
                width: boxWidth,
                height: boxHeight,
                borderColor: rgb(1, 0, 0),
                borderWidth: 0.5
            });
        }
    };

    const drawCheck = (value: any, x: number, y: number, debug: boolean = false, boxWidth: number = 10, boxHeight: number = 10) => {
        const isChecked = Boolean(value);
        page.drawText(isChecked ? 'X' : '', {
            x,
            y,
            size: 12,
            font: fontBold,
            color: rgb(0, 0, 0)
        });

        if (debug) {
            page.drawRectangle({
                x: x - 3,
                y: y - 3,
                width: 14,
                height: 14,
                borderColor: rgb(1, 0, 0),
                borderWidth: 0.5
            });
        }

    };

    draw(data?.caseNumber, 118, 693, 8, false, rgb(0, 0, 0), 50, 10, 'center');
    draw(formatDateTime(data?.reportedAt), 276, 690, 8, false, rgb(0, 0, 0), 53, 12, 'center');
    draw(formatDateTime(data?.serviceData?.attendedAt), 393, 690, 8, false, rgb(0, 0, 0), 50, 12, 'center');
    draw(formatDateTime(data?.serviceData?.solvedAt), 515, 690, 8, false, rgb(0, 0, 0), 50, 12, 'center');

    draw(data?.serviceData?.description, 25, 590, 8, false, rgb(0, 0, 0), 250, 65);
    draw(data?.serviceType === 'Solicitud' ? 'X' : '', 305, 640, 12, false, rgb(0, 0, 0), 7, 12);
    draw(data?.serviceType === 'Incidente' ? 'X' : '', 305, 617, 12, false, rgb(0, 0, 0), 7, 12);
    draw(data?.serviceType === 'Concepto técnico' ? 'X' : '', 305, 595, 12, false, rgb(0, 0, 0), 7, 12);
    draw(data?.dependency, 428, 648, 8, false, rgb(0, 0, 0), 160, 12, 'center');
    draw(data?.reportedBy?.name, 428, 615, 8, false, rgb(0, 0, 0), 160, 12, 'center');
    draw(data?.reportedBy?.position, 428, 588, 8, false, rgb(0, 0, 0), 160, 12, 'center');

    const equipmentYStart = 544;
    const equipmentRowHeight = 14;
    const equipmentList = data?.serviceData?.equipments || [];
    equipmentList.forEach((item: any, index: number) => {
        const y = equipmentYStart - (index * equipmentRowHeight);
        draw(item?.name, 64, y, 8, false, rgb(0, 0, 0), 73, 12, 'center');
        draw(item?.brand, 143, y, 8, false, rgb(0, 0, 0), 106, 12, 'center');
        draw(item?.model, 255, y, 8, false, rgb(0, 0, 0), 151, 12, 'center');
        const serial = item?.serial?.toString().trim();
        const inventory = item?.inventoryNumber?.toString().trim();
        const serialInventory = serial && inventory
            ? `${serial} / ${inventory}`
            : serial || inventory || 'N/A';
        draw(serialInventory, 412, y, 8, false, rgb(0, 0, 0), 117, 12);

        const conventionMap: Record<string, string> = {
            "Se encuentra en estado de obsolecencia tecnológica para la entidad.": "A",
            "Se encuentra en estado inservible, para dar de baja.": "B",
            "Se encuentra en estado funcionalmente bueno, se sugiere la permanencia del mismo.": "C",
            "Se encuentra averiado debe ser reparado y/o actualizado.": "D"
        };
        const conventionKey = conventionMap[item?.convention?.toString().trim()] || "N/A";
        draw(conventionKey, 559, y, 8, false, rgb(0, 0, 0), 5, 12);

    });

    draw(data?.serviceData?.diagnosis, 120, 390, 10, false, rgb(0, 0, 0), 469, 40);
    draw(data?.serviceData?.solution, 120, 344, 10, false, rgb(0, 0, 0), 469, 40);
    draw(data?.observations, 120, 299, 10, false, rgb(0, 0, 0), 469, 40);

    const materialsYStart = 264;
    const materialsRowHeight = 11;
    const columnSpacing = 275;
    const materialsList = data?.serviceData?.materials || [];
    materialsList.forEach((material: any, index: number) => {
        const column = index < 5 ? 0 : 1;
        const rowIndex = index % 5;
        const xOffset = column * columnSpacing;
        const y = materialsYStart - (rowIndex * materialsRowHeight);
        draw(material?.quantity, 33 + xOffset, y, 8, false, rgb(0, 0, 0), 17, 12, 'center');
        draw(material?.description, 65 + xOffset, y, 8, false, rgb(0, 0, 0), 234, 12, 'center');
    });

    if (data?.assignedTechnician?.signature) {
        try {
            const imgBase64 = data.assignedTechnician.signature.split(',')[1];
            const imageBytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, { x: 120, y: 170, width: 104, height: 40 });
        } catch (error) {
            console.error('Error al procesar firma:', error);
        }
    }
    draw(data?.assignedTechnician?.name, 65, 159, 7, false, rgb(0, 0, 0), 207, 10, 'center');
    draw(data?.assignedTechnician?.position, 65, 143, 7, false, rgb(0, 0, 0), 207, 10, 'center');

    if (data?.reportedBy?.signature) {
        try {
            const imgBase64 = data.reportedBy.signature.split(',')[1];
            const imageBytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, { x: 420, y: 170, width: 104, height: 40 });
        } catch (error) {
            console.error('Error al procesar firma:', error);
        }
    }
    draw(data?.reportedBy?.name, 378, 159, 7, false, rgb(0, 0, 0), 184, 10, 'center');
    draw(data?.reportedBy?.position, 378, 143, 7, false, rgb(0, 0, 0), 184, 10, 'center');

    const ratingPositions = [132, 265, 389, 510];
    const effectivenessY = 111;
    [1, 2, 3, 4].forEach((rating, index) => {
        drawCheck(data?.effectivenessRating?.value === rating, ratingPositions[index], effectivenessY);
    });

    const satisfactionY = 77;
    [1, 2, 3, 4].forEach((rating, index) => {
        drawCheck(data?.satisfactionRating?.value === rating, ratingPositions[index], satisfactionY);
    });

    return pdfDoc;
}
