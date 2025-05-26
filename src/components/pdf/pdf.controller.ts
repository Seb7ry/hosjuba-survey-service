// src/pdf/pdf.controller.ts
import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) { }

  @Post('preventive')
  async generatePreventive(@Body() data: any, @Res() res: Response) {
    const buffer = await this.pdfService.generatePreventivePdf(data);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=preventive.pdf',
    });
    res.send(buffer);
  }
}
