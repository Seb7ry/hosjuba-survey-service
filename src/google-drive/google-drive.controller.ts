import { Controller, Get, Param, Post, Query, StreamableFile, UploadedFile, UseInterceptors } from "@nestjs/common";
import { DriveService } from "./google-drive.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { Express } from 'express';

@Controller('drive')
export class DriveController {
    constructor(private readonly drive:DriveService){ }

    @Get('files')
    async listFiles(@Query('folder') folder: string) {
        return this.drive.listFiles(folder);
    }

    @Get('search')
    async search(@Query('folder') folder: string,@Query('name') name: string) {
        return this.drive.findFilebyName(folder, name);
    }

    @Get('files/:id/download')
    async download(@Param('id') id:string): Promise<StreamableFile> {
        return this.drive.downloadFile(id);
    }

    @Post('upload/:folderId')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('folderId') folderId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return await this.drive.uploadFile(file.buffer, file.originalname, folderId);
    }
}