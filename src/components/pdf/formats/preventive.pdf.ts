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
        debug: boolean = false
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
                page.drawText(line, {
                    x,
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


    // === INFORMACIÓN BÁSICA ===
    draw(data?.caseNumber, 102, 698, 8, false, rgb(0, 0, 0), 46, 8);

    const { day, month, year } = splitDateParts(data?.reportedAt);
    draw(day, 325, 698, 8, false, rgb(0, 0, 0), 45, 8);
    draw(month, 390, 698, 8, false, rgb(0, 0, 0), 32, 8);
    draw(year, 439, 698, 8, false, rgb(0, 0, 0), 38, 8);

    // === INFORMACIÓN DEL EQUIPO ===
    draw(data?.serviceData?.type || '', 97, 669, 10, false, rgb(0, 0, 0), 220, 8);
    draw(data?.serviceData?.brand || '', 97, 658, 10, false, rgb(0, 0, 0), 220, 8);
    draw(data?.serviceData?.model || '', 97, 647, 10, false, rgb(0, 0, 0), 220, 8);
    draw(data?.serviceData?.serial || '', 97, 636, 10, false, rgb(0, 0, 0), 220, 8);
    draw(data?.serviceData?.numberInventory || '', 97, 625, 10, false, rgb(0, 0, 0), 220, 8);

    draw(data?.dependency || '', 402, 669, 10, false, rgb(0, 0, 0), 184, 8);
    draw(data?.serviceData?.location || '', 402, 658, 10, false, rgb(0, 0, 0), 184, 8);
    draw(data?.reportedBy?.name || '', 402, 642, 10, false, rgb(0, 0, 0), 184, 8);
    draw(data?.reportedBy?.position || '', 402, 625, 10, false, rgb(0, 0, 0), 184, 8);

    // === OBSERVACIONES ===
    draw(data?.observations || '', 26, 183, 10, false, rgb(0, 0, 0), 560, 33);

    // === CHECKBOXES ===
    const baseY = 1340;
    const spacing = 22;

    const coordsMap: Record<string, [number, number]> = {
        // HARDWARE (izquierda)
        limpiezaDeVentiladores: [70, baseY],
        limpiezaUnidadesDeAlmacenamiento: [70, baseY - spacing],
        limpiezaDeModulosDeMemoria: [70, baseY - spacing * 2],
        limpiezaDeTarjetasYPlacaMadre: [70, baseY - spacing * 3],
        limpiezaFuenteDePoder: [70, baseY - spacing * 4],
        limpiezaExternaChasis: [70, baseY - spacing * 5],
        reconexionYAjusteDeProcesador: [70, baseY - spacing * 6],
        reconexionYAjusteDeModulosDeMemoriaRam: [70, baseY - spacing * 7],
        reconexionYAjusteTarjetasDeExpansion: [70, baseY - spacing * 8],
        reconexionYAjusteDeUnidadesDeAlmacenamiento: [70, baseY - spacing * 9],
        reconexionYAjusteDeFuenteDePoder: [70, baseY - spacing * 10],
        reconexionYAjusteDePuertosDeChasis: [70, baseY - spacing * 11],
        reconexionYAjusteDeTeclado: [70, baseY - spacing * 12],
        reconexionYAjusteDeMouse: [70, baseY - spacing * 13],
        reconexionYAjusteDeMonitor: [70, baseY - spacing * 14],
        reconexionYAjusteImpresora: [70, baseY - spacing * 15],
        reconexionYAjusteDeEscaner: [70, baseY - spacing * 16],
        reconexionYAjusteDeCableDePoder: [70, baseY - spacing * 17],
        reconexionYAjusteDeClabeDeRed: [70, baseY - spacing * 18],
        reconexionYAjusteDeAdaptadorDeCorriente: [70, baseY - spacing * 19],
        verificacionDeFuncionamiento: [70, baseY - spacing * 20],
        inventarioDeHardware: [70, baseY - spacing * 21],

        // SOFTWARE (derecha)
        actualizacionOCambioDelSistemaOperativo: [660, baseY],
        confirmarUsuarioYContrasenaAdministradorLocal: [660, baseY - spacing],
        confirmarOAsignarContrasenaEstandar: [660, baseY - spacing * 2],
        configuracionDeSegmentoDeRedYDnsDeConexionADominioEInternet: [660, baseY - spacing * 3],
        identificacionDeUnidadesDeAlmacenamiento: [660, baseY - spacing * 4],
        comprobacionYReparacionDeErroresDeDiscoDuro: [660, baseY - spacing * 5],
        desfragmentacionDeDiscoDuro: [660, baseY - spacing * 6],
        eliminacionDeArchivosTemporales: [660, baseY - spacing * 7],
        actualizacionConfiguracionYSolucionesDeSeguridadInformaticaTraficoSeguro: [660, baseY - spacing * 8],
        confirmarSeguridadDeWindowsBitlockerEnParticionesDeDisco: [660, baseY - spacing * 9],
        confirmarInstalarYConfigurarServicioDeMensajeriaInterna: [660, baseY - spacing * 10],
        confirmarInstalarServicioRemotoYHabilitarReglasEnElFirewall: [660, baseY - spacing * 11],
        confirmarUsuarioDeDominioEnActiveDirectoryDeAcuerdoAlServicio: [660, baseY - spacing * 12],
        confirmacionDeAplicacionesEquiposDeUsoAsistencial: [660, baseY - spacing * 13],
        confirmacionDeAplicacionesEquiposDeUsoAdministrativo: [660, baseY - spacing * 14],
        confirmacionDeUnidadDeAlmacenamientoDestinadaParaElUsuario: [660, baseY - spacing * 15],
        instalarRecursosCompartidosImpresorasOEscaner: [660, baseY - spacing * 16],
        configuracionServicioDeNubeYServiciosTecnologicos: [660, baseY - spacing * 17],
        activacionPlanDeEnergia: [660, baseY - spacing * 18],
        crearPuntoDeRestauracion: [660, baseY - spacing * 19],
        inventarioDeSoftware: [660, baseY - spacing * 20],
    };

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
    draw(data?.assignedTechnician?.name || '', 100, 114, 10, false, rgb(0, 0, 0), 199, 8);
    draw(data?.assignedTechnician?.position || '', 100, 96, 10, false, rgb(0, 0, 0), 199, 8);

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
    draw(data?.reportedBy?.name || '', 369, 114, 10, false, rgb(0, 0, 0), 199, 8);
    draw(data?.reportedBy?.position || '', 369, 96, 10, false, rgb(0, 0, 0), 199, 8);


    const ratingPositions = [109, 230, 379, 494];
    const effectivenessY = 59;
    [1, 2, 3, 4].forEach((rating, index) => {
        drawCheck(data?.effectivenessRating?.value === rating, ratingPositions[index], effectivenessY);
    });

    return pdfDoc;
}