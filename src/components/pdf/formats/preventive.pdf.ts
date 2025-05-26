import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';
import * as path from 'path';

export async function drawPreventiveTemplate(pdfDoc: PDFDocument, data: any): Promise<PDFDocument> {
    const templatePath = path.join(__dirname, '..', '..', '..', 'assets', 'PA-GSI-GARI-R1.pdf');
    if (!fs.existsSync(templatePath)) throw new Error(`No se encontró la plantilla: ${templatePath}`);

    const templateBytes = fs.readFileSync(templatePath);
    const templateDoc = await PDFDocument.load(templateBytes);
    const [templatePage] = await pdfDoc.copyPages(templateDoc, [0]);
    const page = pdfDoc.addPage(templatePage);

    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const draw = (text: string, x: number, y: number, size = 14, color = rgb(0, 0, 0)) => {
        page.drawText(text || '<< vacío >>', { x, y, size, font, color });
        // Debug box
        page.drawRectangle({ x: x - 2, y: y - 2, width: 200, height: size + 4, borderColor: rgb(1, 0, 0), borderWidth: 0.5 });
    };

    const drawCheck = (value: boolean, x: number, y: number) => {
        page.drawText(value ? 'X' : '-', { x, y, size: 14, font, color: rgb(0, 0.2, 0.6) });
        page.drawRectangle({ x: x - 3, y: y - 3, width: 14, height: 14, borderColor: rgb(1, 0, 0), borderWidth: 0.5 });
    };

    const drawPoint = (x: number, y: number) => {
        page.drawCircle({ x, y, size: 1, color: rgb(1, 0, 0) });
    };

    // === CAMPOS DE TEXTO ===
    draw(data.caseNumber, 200, 1500);                   // Número de caso
    draw(new Date(data.reportedAt).toLocaleDateString(), 950, 1500); // Fecha

    draw(data.serviceData?.numberInventory || '', 200, 1430);
    draw(data.serviceData?.type || '', 150, 1400);
    draw(data.serviceData?.brand || '', 400, 1400);
    draw(data.serviceData?.model || '', 700, 1400);
    draw(data.serviceData?.serial || '', 950, 1400);

    draw(data.reportedBy?.name || '', 150, 130); // Nombre usuario
    draw(data.reportedBy?.position || '', 550, 130); // Cargo usuario
    draw(data.assignedTechnician?.name || '', 150, 90); // Técnico
    draw(data.assignedTechnician?.position || '', 550, 90);

    // === OBSERVACIONES ===
    const obs = data.observations || '';
    const obsLines = obs.match(/.{1,100}/g) ?? [''];
    obsLines.forEach((line, i) => draw(line, 100, 260 - i * 16, 12));

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

    for (const [field, [x, y]] of Object.entries(coordsMap)) {
        const val = data.serviceData?.hardware?.[field]
            ?? data.serviceData?.software?.[field]
            ?? data.serviceData?.printers?.[field]
            ?? data.serviceData?.phones?.[field]
            ?? data.serviceData?.scanners?.[field];
        drawCheck(!!val, x, y);
    }

    // === FIRMA DEL TÉCNICO ===
    if (data.assignedTechnician?.signature) {
        const imgBase64 = data.assignedTechnician.signature.split(',')[1];
        const imageBytes = Uint8Array.from(atob(imgBase64), c => c.charCodeAt(0));
        const image = await pdfDoc.embedPng(imageBytes);
        page.drawImage(image, { x: 150, y: 340, width: 130, height: 50 });
    }

    return pdfDoc;
}
