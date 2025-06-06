import { Controller, Post, Body, Res, HttpStatus, Param, Req, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { PdfService } from './pdf.service';
import { AuthGuard } from '../authentication/auth.guard';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) { }

  @Post('preventive/:caseNumber')
  @UseGuards(AuthGuard)
  async generatePreventive(@Param('caseNumber') caseNumber: string, @Req() req: Request, @Res() res: Response) {
    try {
      const buffer = await this.pdfService.generatePreventivePdf(req, caseNumber);
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
  @UseGuards(AuthGuard)
  async generateCorrective(@Param('caseNumber') caseNumber: string, @Req() req: Request, @Res() res: Response) {
    try {
      const buffer = await this.pdfService.generateCorrectivePdf(req, caseNumber);
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