import { Body, Controller, Get, HttpStatus, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { OneDriveService } from "./one-drive.service";
import { Response } from "express";
import { Readable } from "stream";
import { FileInterceptor } from "@nestjs/platform-express";

import * as dotenv from 'dotenv';
import { AuthGuard } from "src/components/authentication/auth.guard";
dotenv.config();

@Controller('one-drive')
export class OneDriveController {
    constructor(private readonly oneDriveService: OneDriveService){ }

    @Get('listDocument')
    @UseGuards(AuthGuard)
    async listDocuments(){
        return this.oneDriveService.listDocuments();
    }

    @Get('listTemplate')
    @UseGuards(AuthGuard)
    async listTemplates(){
        return this.oneDriveService.listTemplates();
    }

    @Get('search/:query')
    @UseGuards(AuthGuard)
    async searchFiles(@Param('query') query: string) {
        return this.oneDriveService.searchFilesByName(query);
    }

    @Get('download/:fileId')
    @UseGuards(AuthGuard)
    async downloadFile(@Param('fileId') fileId: string, @Res() res: Response) {
        try {
            const fileBuffer = await this.oneDriveService.downloadFile(fileId);
            const buffer = Buffer.from(fileBuffer);
            const readableStream = Readable.from(buffer);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="${fileId}.pdf"`,
                'Content-Length': buffer.length,
            });

            readableStream.pipe(res);
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
        }
    }

    @Post('upload')
    @UseGuards(AuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('name') name: string
    ) {
        return this.oneDriveService.uploadFileDocument(file, name);
    }
}