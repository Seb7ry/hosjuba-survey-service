import { BadRequestException, Injectable, NotFoundException, StreamableFile } from "@nestjs/common";
import { PassThrough, Readable } from "stream";
import { drive_v3, google } from "googleapis";
import { JWT } from "google-auth-library";
import * as path from 'path';
import * as fs from 'fs';

require('dotenv').config();

@Injectable()
export class GoogleDriveService {
    private drive: drive_v3.Drive;

    constructor() {
        const credentialsPath = path.join(__dirname, '../../../credentials/google-drive-sa.json');
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
        const auth = new JWT({
            email: credentials.client_email,
            key: credentials.private_key,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        this.drive = google.drive({ version: 'v3', auth });
    }

    async listFiles(folderId?: string) {
        if (!folderId) {
            throw new BadRequestException('El ID de la carpeta de Drive es obligatorio.');
        }

        try {
            const res = await this.drive.files.list({
                q: `'${folderId}' in parents and trashed=false`,
                fields: 'files(id,name)',
            });

            return res.data.files;
        } catch (error) {
            throw new BadRequestException(`Error al listar los archivos desde google drive: ${error.message}`);
        }
    }

    async findFilebyName(folderId?: string, name?: string) {
        if (!folderId) {
            throw new BadRequestException('El ID de la carpeta de Drive es obligatorio.');
        }

        if (!name) {
            throw new BadRequestException('El nombre es obligatorio.');
        }

        try {
            const res = await this.drive.files.list({
                q: `name contains '${name}' and '${folderId}' in parents and trashed=false`,
                fields: 'files(id,name)',
            });

            const files = res.data.files ?? [];
            if (files.length === 0) {
                throw new NotFoundException('No se encontraron archivos.');
            }

            return files;
        } catch (error) {
            throw new BadRequestException(`Error al buscar el archivo en google drive: ${error.message}`);
        }
    }

    async downloadFile(fileId?: string): Promise<StreamableFile> {
        if (!fileId) {
            throw new BadRequestException('El ID del archivo es obligatorio.');
        }

        try {
            const res = await this.drive.files.get(
                { fileId, alt: 'media' },
                { responseType: 'stream' },
            );

            const stream = new PassThrough();
            res.data.pipe(stream);
            return new StreamableFile(stream, {
                type: 'application/pdf',
                disposition: `attachment; filename="${fileId}.pdf"`,
            });
        } catch (error) {
            throw new NotFoundException(`Error al descargar el archivo de google drive: ${error.message}`);
        }
    }

    async uploadFile(buffer: Buffer, name: string, folderId: string): Promise<any> {
        if (!buffer || !name || !folderId) {
            throw new BadRequestException('El buffer, el nombre y el ID de la carpeta son obligatorios.');
        }

        try {
            const fileMetadata = {
                name: name,
                parents: [folderId],
            };

            const media = {
                mimeType: 'application/pdf',
                body: Readable.from(buffer),
            };

            const res = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, name',
            });

            return res.data;
        } catch (error) {
            throw new BadRequestException(`Error al subir el archivo a google drive: ${error.message}`);
        }
    }
}