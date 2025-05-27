// src/pdf/pdf.controller.ts
import { Controller, Post, Body, Res, HttpStatus, Param } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) { }

  @Post('preventive/:caseNumber')
  async generatePreventive(@Param('caseNumber') caseNumber: string, @Res() res: Response) {
    try {
      const buffer = await this.pdfService.generatePreventivePdf(caseNumber);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=preventive.pdf',
      });
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Error al generar el PDF preventivo',
      });
    }
  }

  @Post('corrective/:caseNumber')
  async generateCorrective(@Param('caseNumber') caseNumber: string, @Res() res: Response) {
    try {
      const buffer = await this.pdfService.generateCorrectivePdf(caseNumber);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename=corrective.pdf',
      });
      res.status(HttpStatus.OK).send(buffer);
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: error.message || 'Error al generar el PDF correctivo',
      });
    }
  }
}