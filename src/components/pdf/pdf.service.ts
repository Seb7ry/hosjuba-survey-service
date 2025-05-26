// src/pdf/pdf.service.ts
import { Injectable } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { drawPreventiveTemplate } from './formats/preventive.pdf';

@Injectable()
export class PdfService {
  async generatePreventivePdf(data: any): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    await drawPreventiveTemplate(pdfDoc, data);
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
