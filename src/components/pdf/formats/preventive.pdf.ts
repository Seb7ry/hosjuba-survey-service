import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

function splitDateParts(dateInput: string | Date | undefined): { day: string, month: string, year: string } {
    if (!dateInput) return { day: '', month: '', year: '' };
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return { day: '', month: '', year: '' };

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    return { day, month, year };
}

export async function drawPreventiveTemplate(pdfDoc: PDFDocument, data: any = {}): Promise<PDFDocument> {
    if (!data || typeof data !== 'object') {
        data = {};
    }

    const templatePath = path.join('src', 'assets', 'PA-GSI-GARI-R1.pdf');
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
                x,
                y,
                width: boxWidth,
                height: boxHeight,
                borderColor: rgb(1, 0, 0),
                borderWidth: 0.5
            });
        }
    };

    draw(data?.caseNumber, 96, 698, 8, false, rgb(0, 0, 0), 48, 8, 'center');

    const { day, month, year } = splitDateParts(data?.reportedAt);
    draw(day, 320, 698, 8, false, rgb(0, 0, 0), 45, 8, 'center');
    draw(month, 385, 698, 8, false, rgb(0, 0, 0), 32, 8, 'center');
    draw(year, 433, 698, 8, false, rgb(0, 0, 0), 38, 8, 'center');

    draw(data?.serviceData?.type || '', 97, 669, 10, false, rgb(0, 0, 0), 220, 8, 'center');
    draw(data?.serviceData?.brand || '', 97, 658, 10, false, rgb(0, 0, 0), 220, 8, 'center');
    draw(data?.serviceData?.model || '', 97, 647, 10, false, rgb(0, 0, 0), 220, 8, 'center');
    draw(data?.serviceData?.serial || '', 97, 636, 10, false, rgb(0, 0, 0), 220, 8, 'center');
    draw(data?.serviceData?.numberInventory || '', 97, 625, 10, false, rgb(0, 0, 0), 220, 8, 'center');

    draw(data?.dependency || '', 402, 669, 10, false, rgb(0, 0, 0), 184, 8, 'center');
    draw(data?.serviceData?.location || '', 402, 658, 10, false, rgb(0, 0, 0), 184, 8, 'center');
    draw(data?.reportedBy?.name || '', 402, 642, 10, false, rgb(0, 0, 0), 184, 8, 'center');
    draw(data?.reportedBy?.position || '', 402, 625, 10, false, rgb(0, 0, 0), 184, 8, 'center');


    draw(data?.observations || '', 26, 183, 10, false, rgb(0, 0, 0), 560, 33);

    function drawSectionChecks(
        dataSection: any,
        items: string[],
        xNA: number,
        xYes: number,
        xNo: number,
        yStart: number,
        yStep: number
    ) {
        let currentY = yStart;
        for (const item of items) {
            const entry = dataSection?.[item];

            drawCheck(false, xNA, currentY, false);
            drawCheck(false, xYes, currentY, false);
            drawCheck(false, xNo, currentY, false);

            if (entry?.enabled === false) {
                drawCheck(true, xNA, currentY, false);
            }

            if (entry?.enabled !== false && entry?.value !== undefined) {
                if (entry.value === true) {
                    drawCheck(true, xYes, currentY, false);
                } else if (entry.value === false) {
                    drawCheck(true, xNo, currentY, false);
                }
            }

            currentY += yStep;
        }
    }

    const hardwareItems = [
        'limpiezaDeVentiladores',
        'limpiezaUnidadesDeAlmacenamiento',
        'limpiezaDeModulosDeMemoria',
        'limpiezaDeTarjetasYPlacaMadre',
        'limpiezaFuenteDePoder',
        'limpiezaExternaChasis',
        'reconexionYAjusteDeProcesador',
        'reconexionYAjusteDeModulosDeMemoriaRam',
        'reconexionYAjusteTarjetasDeExpansion',
        'reconexionYAjusteDeUnidadesDeAlmacenamiento',
        'reconexionYAjusteDeFuenteDePoder',
        'reconexionYAjusteDePuertosDeChasis',
        'reconexionYAjusteDeTeclado',
        'reconexionYAjusteDeMouse',
        'reconexionYAjusteDeMonitor',
        'reconexionYAjusteImpresora',
        'reconexionYAjusteDeEscaner',
        'reconexionYAjusteDeCableDePoder',
        'reconexionYAjusteDeClabeDeRed',
        'reconexionYAjusteDeAdaptadorDeCorriente',
        'verificacionDeFuncionamiento',
        'inventarioDeHardware',
    ];
    drawSectionChecks(data?.serviceData?.hardware, hardwareItems, 227, 247.5, 268.5, 582, -11.7);

    const softwareItems = [
        'actualizacionOCambioDelSistemaOperativo',
        'confirmarUsuarioYContrasenaAdministradorLocal',
        'confirmarOAsignarContrasenaEstandar',
        'configuracionDeSegmentoDeRedYDnsDeConexionADominioEInternet',
        'identificacionDeUnidadesDeAlmacenamiento',
        'comprobacionYReparacionDeErroresDeDiscoDuro',
        'desfragmentacionDeDiscoDuro',
        'eliminacionDeArchivosTemporales',
        'actualizacionConfiguracionYSolucionesDeSeguridadInformaticaTraficoSeguro',
        'confirmarSeguridadDeWindowsBitlockerEnParticionesDeDisco',
        'confirmarInstalarYConfigurarServicioDeMensajeriaInterna',
        'confirmarInstalarServicioRemotoYHabilitarReglasEnElFirewall',
        'confirmarUsuarioDeDominioEnActiveDirectoryDeAcuerdoAlServicio',
        'confirmacionDeAplicacionesEquiposDeUsoAsistencial',
        'confirmacionDeAplicacionesEquiposDeUsoAdministrativo',
        'confirmacionDeUnidadDeAlmacenamientoDestinadaParaElUsuario',
        'instalarRecursosCompartidosImpresorasOEscaner',
        'configuracionServicioDeNubeYServiciosTecnologicos',
        'activacionPlanDeEnergia',
        'crearPuntoDeRestauracion',
        'inventarioDeSoftware',
    ];
    drawSectionChecks(data?.serviceData?.software, softwareItems, 532, 555, 574.5, 582, -11.7);

    const printerItems = [
        'limpiezaInterna',
        'lubricacionYAjusteSistemaEngranaje',
        'limpiezaExterna',
        'verificacionDeFuncionamiento',
        'activacionModoBorradorYAhorroDeEnergia',
    ];
    drawSectionChecks(data?.serviceData?.printers, printerItems, 227, 247.5, 268.5, 300.5, -11.7);

    const phoneItems = [
        'verificacionYAjusteDeCablesDeConexion',
        'verificacionDeFuncionamiento',
        'verificacionDeDisponibilidadYFuncionamientoDeLaExtensionTelefonica',
        'limpieza',
    ];
    drawSectionChecks(data?.serviceData?.phones, phoneItems, 532, 555, 574.5, 324, -11.7);

    const scannerItems = [
        'verificacionYAjusteDeCablesDeConexion',
        'verificacionDeFuncionamiento',
        'limpieza',
    ];
    drawSectionChecks(data?.serviceData?.scanners, scannerItems, 532, 555, 574.5, 265.2, -11.7);

    if (data?.assignedTechnician?.signature) {
        try {
            const imgBase64 = data.assignedTechnician.signature.split(',')[1];
            const imageBytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, { x: 150, y: 130, width: 104, height: 40 });
        } catch (error) {
            console.error('Error al procesar firma:', error);
        }
    }
    draw(data?.assignedTechnician?.name || '', 97, 114, 10, false, rgb(0, 0, 0), 185, 8, 'center');
    draw(data?.assignedTechnician?.position || '', 97, 96, 10, false, rgb(0, 0, 0), 185, 8, 'center');

    if (data?.reportedBy?.signature) {
        try {
            const imgBase64 = data.reportedBy.signature.split(',')[1];
            const imageBytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
            const image = await pdfDoc.embedPng(imageBytes);
            page.drawImage(image, { x: 420, y: 130, width: 104, height: 40 });
        } catch (error) {
            console.error('Error al procesar firma:', error);
        }
    }
    draw(data?.reportedBy?.name || '', 369, 114, 10, false, rgb(0, 0, 0), 199, 8, 'center');
    draw(data?.reportedBy?.position || '', 369, 96, 10, false, rgb(0, 0, 0), 199, 8, 'center');

    const ratingPositions = [109, 230, 379, 494];
    const effectivenessY = 59;
    [1, 2, 3, 4].forEach((rating, index) => {
        drawCheck(data?.effectivenessRating?.value === rating, ratingPositions[index], effectivenessY);
    });

    return pdfDoc;
}