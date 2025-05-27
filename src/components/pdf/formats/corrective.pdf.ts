// src/pdf/formats/corrective.pdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export async function drawCorrectiveTemplate(pdfDoc: PDFDocument, data: any = {}): Promise<PDFDocument> {
    // Validación inicial robusta
    if (!data || typeof data !== 'object') {
        data = {};
    }

    const templatePath = path.join(__dirname, '..', '..', '..', 'assets', 'PA-GSI-GARI-R2.pdf');
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
        size: number = 10 ,
        bold: boolean = false,
        color = rgb(0, 0, 0),
        boxWidth: number = 200,
        debug: boolean = true
    ) => {
        const displayText = text?.toString() || '';
        page.drawText(displayText, {
            x,
            y,
            size,
            font: bold ? fontBold : font,
            color,
            maxWidth: boxWidth
        });

        if (debug) {
            page.drawRectangle({
                x: x - 2,
                y: y - 2,
                width: boxWidth,
                height: size + 4,
                borderColor: rgb(1, 0, 0),
                borderWidth: 0.5
            });
        }
    };

    const drawCheck = (value: any, x: number, y: number) => {
        const isChecked = Boolean(value);
        page.drawText(isChecked ? 'X' : '', {
            x,
            y,
            size: 12,
            font: fontBold,
            color: rgb(0, 0.2, 0.6)
        });
        page.drawRectangle({
            x: x - 3,
            y: y - 3,
            width: 14,
            height: 14,
            borderColor: rgb(1, 0, 0),
            borderWidth: 0.5
        });
    };

    // === 1. DATOS DEL CASO ===
    draw(data?.caseNumber, 120, 693, 8, false, rgb(0, 0, 0), 50); 
    draw(data?.reportedAt, 278, 693, 8, false, rgb(0, 0, 0), 53);
    draw(data?.serviceData?.attendedAt, 395, 693, 8, false, rgb(0, 0, 0), 50); 
    draw(data?.serviceData?.solvedAt, 517, 693, 8, false, rgb(0, 0, 0), 50); 

    // === 2. SERVICIO ===
    draw(data?.serviceData?.description, 25, 590, 65, false, rgb(0, 0, 0), 250); 
    draw(data?.serviceType === 'Solicitud' ? 'X' : '', 288, 639, 12, true, rgb(0, 0, 0), 43); 
    draw(data?.serviceType === 'Incidente' ? 'X' : '', 288, 616, 12, true, rgb(0, 0, 0), 43); 
    draw(data?.serviceType === 'Concepto Técnico' ? 'X' : '', 288, 593, 12, true, rgb(0, 0, 0), 43); 
    draw(data?.dependency, 431, 648, 15, false, rgb(0, 0, 0), 160)
    draw(data?.reportedBy?.name, 431, 615, 15, false, rgb(0, 0, 0), 160); 
    draw(data?.reportedBy?.position, 431, 588, 15, false, rgb(0, 0, 0), 160); 

    // === 3. EQUIPOS ===
    const equipmentYStart = 648;
    const equipmentRowHeight = 20;

    const equipmentList = data?.equipment || [];
    equipmentList.forEach((item: any, index: number) => {
        const y = equipmentYStart - (index * equipmentRowHeight);
        draw((index + 1).toString(), 431, y, 10, false, rgb(0, 0, 0), 20); // Ítem (ancho mínimo)
        draw(item?.equipment, 431, y, 10, false, rgb(0, 0, 0), 120); // Equipo
        draw(item?.brand, 431, y, 10, false, rgb(0, 0, 0), 100); // Marca
        draw(item?.model, 431, y, 10, false, rgb(0, 0, 0), 100); // Modelo
        draw(item?.serial, 431, y, 10, false, rgb(0, 0, 0), 120); // Serial
        draw(item?.conventions, 431, y, 10, false, rgb(0, 0, 0), 50); // Convenciones
    });

    // === 4. CONVENCIONES ===

    // === 5. DIAGNÓSTICO, SOLUCIÓN Y OBSERVACIONES ===
    draw(data?.diagnosis, 50, 380, 10, false, rgb(0, 0, 0), 500); // Diagnóstico (ancho máximo)
    draw(data?.solution, 50, 300, 10, false, rgb(0, 0, 0), 500); // Solución (ancho máximo)

    // Observaciones con ajuste de ancho y multilínea
    const observations = data?.observations || '';
    const obsLines = observations.match(/.{1,120}/g) ?? [''];
    obsLines.forEach((line: string, i: number) => {
        draw(line, 50, 220 - i * 16, 9, false, rgb(0, 0, 0), 500, false); // Sin debug para observaciones
    });

    // === 6. MATERIALES ===
    const materialsYStart = 180;
    const materialsRowHeight = 20;

    const materialsList = data?.materials || [];
    materialsList.forEach((material: any, index: number) => {
        const y = materialsYStart - (index * materialsRowHeight);
        draw(material?.quantity, 50, y, 10, false, rgb(0, 0, 0), 40); // Cantidad (ancho reducido)
        draw(material?.description, 100, y, 10, false, rgb(0, 0, 0), 400); // Descripción (ancho amplio)
    });

    // === 7. FIRMAS ===
    draw(data?.technician?.name, 100, 100, 10, true, rgb(0, 0, 0), 150); // Nombre técnico (negrita)
    draw(data?.technician?.position, 100, 85, 10, false, rgb(0, 0, 0), 150); // Cargo técnico
    draw(data?.user?.name, 350, 100, 10, true, rgb(0, 0, 0), 150); // Nombre usuario (negrita)
    draw(data?.user?.position, 350, 85, 10, false, rgb(0, 0, 0), 150); // Cargo usuario

    // === 8. CALIFICACIONES ===
    const ratingY = 60;

    // Calificación de resolución (1-4)
    [1, 2, 3, 4].forEach((rating) => {
        drawCheck(data?.resolutionRating === rating, 50 + (rating * 30), ratingY);
    });

    // Calificación de satisfacción (1-4)
    [1, 2, 3, 4].forEach((rating) => {
        drawCheck(data?.satisfactionRating === rating, 250 + (rating * 30), ratingY);
    });

    // === FIRMA DEL TÉCNICO (opcional) ===
    if (data?.technician?.signature) {
        try {
            const imgBase64 = data.technician.signature.split(',')[1];
            const imageBytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, { x: 150, y: 120, width: 130, height: 50 });
        } catch (error) {
            console.error('Error al procesar firma:', error);
        }
    }

    return pdfDoc;
}