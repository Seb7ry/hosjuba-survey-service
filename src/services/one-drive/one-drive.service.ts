import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { LogService } from 'src/components/log/log.service';

dotenv.config();

@Injectable()
export class OneDriveService {
    constructor(private readonly logService: LogService) {}

    private async getAccessToken(): Promise<string> {
        try {
            const res = await fetch(`https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`, {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: process.env.AZURE_CLIENT_ID!,
                    scope: 'https://graph.microsoft.com/.default',
                    client_secret: process.env.AZURE_CLIENT_SECRET!,
                    grant_type: 'client_credentials',
                }),
            });

            const data = await res.json();
            if (!data.access_token) {
                await this.logService.createLog('error', 'one-drive.service.ts', 'getAccessToken', `Token inválido: ${JSON.stringify(data)}`);
                throw new HttpException('No se pudo obtener el token de acceso.', HttpStatus.UNAUTHORIZED);
            }

            return data.access_token;
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'getAccessToken', error.message);
            throw new HttpException(`Error obteniendo token: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async safeFetch(url: string, token: string, options: RequestInit = {}): Promise<any> {
        const res = await fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: `Bearer ${token}`,
            }
        });

        if (!res.ok) {
            const error = await res.text();
            throw new HttpException(`Error en petición HTTP: ${error}`, res.status);
        }

        return await res.json();
    }

    private async findFolderIdByName(parentId: string | null, folderName: string, token: string): Promise<string | null> {
        const url = parentId
            ? `${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/items/${parentId}/children`
            : `${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/root/children`;

        const data = await this.safeFetch(url, token);
        const folder = data.value.find((item: any) => item.name === folderName && item.folder);
        return folder?.id ?? null;
    }

    private async getFolderIdChain(path: string[], token: string): Promise<string | null> {
        let parentId: string | null = null;
        for (const folderName of path) {
            const folderId = await this.findFolderIdByName(parentId, folderName, token);
            if (!folderId) return null;
            parentId = folderId;
        }
        return parentId;
    }

    private async listFolderFiles(folderId: string, token: string): Promise<any[]> {
        const data = await this.safeFetch(`${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/items/${folderId}/children`, token);
        return data.value
            .filter((file: any) => !file.folder && file.name.endsWith('.pdf'))
            .map((file: any) => ({
                id: file.id,
                name: file.name,
                size: file.size,
                lastModifiedDateTime: file.lastModifiedDateTime,
            }));
    }

    private getAvailableFileName(nameFile: string, existingNames: string[]): string {
        const extension = nameFile.substring(nameFile.lastIndexOf('.')) || '';
        const baseName = nameFile.substring(0, nameFile.lastIndexOf('.')) || nameFile;

        let finalName = nameFile;
        let counter = 1;

        while (existingNames.includes(finalName.toLowerCase())) {
            finalName = `${baseName} (${counter})${extension}`;
            counter++;
        }

        return finalName;
    }

    async listFiles(): Promise<any[]> {
        try {
            const token = await this.getAccessToken();
            const folderId = await this.getFolderIdChain([process.env.ONE_DRIVE_FOLDER_NAME!], token);
            if (!folderId) throw new HttpException('No se encontró la carpeta HosjubaTest.', HttpStatus.NOT_FOUND);
            return await this.listFolderFiles(folderId, token);
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'listFiles', error.message);
            throw new HttpException(`Error al listar archivos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async listTemplates(): Promise<any[]> {
        try {
            const token = await this.getAccessToken();
            const folderId = await this.getFolderIdChain(
                [process.env.ONE_DRIVE_FOLDER_NAME!, process.env.ONE_DRIVE_FOLDER_TEMPLATE!],
                token
            );
            if (!folderId) throw new HttpException('No se encontró la carpeta Plantillas.', HttpStatus.NOT_FOUND);
            return await this.listFolderFiles(folderId, token);
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'listTemplates', error.message);
            throw new HttpException(`Error al listar plantillas: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async searchFilesByName(query: string): Promise<any[]> {
        try {
            const token = await this.getAccessToken();
            const rootId = await this.getFolderIdChain([process.env.ONE_DRIVE_FOLDER_NAME!], token);
            const templatesId = await this.getFolderIdChain(
                [process.env.ONE_DRIVE_FOLDER_NAME!, process.env.ONE_DRIVE_FOLDER_TEMPLATE!],
                token
            );

            const rootFiles = rootId ? await this.listFolderFiles(rootId, token) : [];
            const templateFiles = templatesId ? await this.listFolderFiles(templatesId, token) : [];

            return [...rootFiles, ...templateFiles].filter(file =>
                file.name.toLowerCase().includes(query.toLowerCase())
            );
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'searchFilesByName', error.message);
            throw new HttpException(`Error al buscar archivos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async downloadFile(fileId: string): Promise<any> {
        try {
            const token = await this.getAccessToken();
            const res = await fetch(`${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/items/${fileId}/content`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                await this.logService.createLog('warning', 'one-drive.service.ts', 'downloadFile', `Error al descargar archivo: ${fileId}`);
                throw new HttpException('Error al descargar el archivo.', HttpStatus.NOT_FOUND);
            }

            return await res.arrayBuffer();
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'downloadFile', error.message);
            throw new HttpException(`Error al descargar archivo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async uploadFile(file: Express.Multer.File, targetFolderName: string, nameFile: string): Promise<any> {
        try {
            const token = await this.getAccessToken();
            const folderPath = [process.env.ONE_DRIVE_FOLDER_NAME!];
            if (targetFolderName !== process.env.ONE_DRIVE_FOLDER_NAME) {
                folderPath.push(targetFolderName);
            }

            const targetFolderId = await this.getFolderIdChain(folderPath, token);
            if (!targetFolderId) {
                throw new HttpException(`No se encontró la carpeta destino: ${targetFolderName}`, HttpStatus.NOT_FOUND);
            }

            const existingData = await this.safeFetch(
                `${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/items/${targetFolderId}/children`,
                token
            );
            const existingNames = existingData.value.map((item: any) => item.name.toLowerCase());
            const finalName = this.getAvailableFileName(nameFile, existingNames);

            const uploadUrl = `${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/items/${targetFolderId}:/${finalName}:/content`;
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': file.mimetype,
                },
                body: file.buffer,
            });

            if (!uploadRes.ok) {
                const error = await uploadRes.text();
                throw new HttpException(`Error al subir archivo: ${error}`, uploadRes.status);
            }

            return await uploadRes.json();
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'uploadFile', error.message);
            throw new HttpException(`Error al subir archivo: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}