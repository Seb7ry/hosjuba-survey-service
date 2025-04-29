import { Body, Controller, Get, HttpStatus, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { OneDriveService } from "./one-drive.service";
import { Response } from "express";
import { Readable } from "stream";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('one-drive')
export class OneDriveController {
    constructor(private readonly oneDriveService: OneDriveService){ }

    @Get('list')
    async list(){
        return this.oneDriveService.listFiles();
    }

    @Get('listTemplate')
    async listTemplates(){
        return this.oneDriveService.listTemplates();
    }

    @Get('search/:query')
    async searchFiles(@Param('query') query: string) {
        return this.oneDriveService.searchFilesByName(query);
    }

    @Get('download/:fileId')
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
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('folder') folder: string,
        @Body('fileName') fileName: string
    ) {
        return this.oneDriveService.uploadFile(file, folder, fileName);
    }
}