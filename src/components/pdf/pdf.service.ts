import { Injectable, BadRequestException } from '@nestjs/common';
import { PDFDocument } from 'pdf-lib';
import { drawPreventiveTemplate } from './formats/preventive.pdf';
import { drawCorrectiveTemplate } from './formats/corrective.pdf';
import { CaseService } from '../case/case.service';
import { Request } from 'express';
import { HistoryService } from '../history/history.service';

@Injectable()
export class PdfService {
  constructor(private readonly caseService: CaseService, private readonly historyService: HistoryService) { }

  async generatePreventivePdf(req: Request, caseNumber: string): Promise<Buffer> {
    try {
      const caseData = await this.caseService.findByCaseNumber(caseNumber);
      const pdfDoc = await PDFDocument.create();
      await drawPreventiveTemplate(pdfDoc, caseData);
      const pdfBytes = await pdfDoc.save();

      await this.historyService.createHistory(
        req.user.username,
        `Generó el PDF Preventivo del caso "${caseNumber}".`
      );

      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new BadRequestException(`Error al generar PDF preventivo: ${error.message}`);
    }
  }

  async generateCorrectivePdf(req: Request, caseNumber: string): Promise<Buffer> {
    try {
      const caseData = await this.caseService.findByCaseNumber(caseNumber);
      const pdfDoc = await PDFDocument.create();
      await drawCorrectiveTemplate(pdfDoc, caseData);
      const pdfBytes = await pdfDoc.save();

      await this.historyService.createHistory(
        req.user.username,
        `Generó el PDF Correctivo del caso "${caseNumber}".`
      );

      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new BadRequestException(`Error al generar PDF correctivo: ${error.message}`);
    }
  }
}