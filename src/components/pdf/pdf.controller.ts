import { Controller, Get, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { PdfService } from './pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private readonly pdfService: PdfService) {}

  @Get('generate')
  async generatePdf(@Res() res: Response, @Query() query: any) {
    const buffer = await this.pdfService.generateExamplePdf(query);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="documento.pdf"',
    });
    res.send(buffer);
  }
}
