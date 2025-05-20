import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';

@Injectable()
export class PdfService {
  async generateExamplePdf(data: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);

    const { nombre = 'Desconocido', fecha = 'No especificada' } = data;

    page.drawText(`Nombre: ${nombre}`, { x: 50, y: 350 });
    page.drawText(`Fecha: ${fecha}`, { x: 50, y: 330 });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
