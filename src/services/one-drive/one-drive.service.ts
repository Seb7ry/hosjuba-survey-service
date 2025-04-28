import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { HistoryService } from 'src/components/history/history.service';
import { LogService } from 'src/components/log/log.service';
dotenv.config();

@Injectable()
export class OneDriveService {
    constructor(
        private readonly logService: LogService,
        private readonly historyService: HistoryService
    ){ }

    private async getAccessToken(): Promise<String> {
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

    async listFiles(): Promise<any[]> {
        try {
            const token = await this.getAccessToken();
        
            const folderRes = await fetch(`${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/root/children`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const folderData = await folderRes.json();
        
            const folderId = folderData.value.find(
                (item: any) => item.name === process.env.ONE_DRIVE_FOLDER_NAME && item.folder
            )?.id;
        
            if (!folderId) {
                await this.logService.createLog('warning', 'one-drive.service.ts', 'listFiles', 'No se encontró la carpeta especificada.');
                throw new HttpException('No se encontró la carpeta en OneDrive.', HttpStatus.NOT_FOUND);
            }
        
            const filesRes = await fetch(`${process.env.GRAPH}/drives/${process.env.ONE_DRIVE_ID}/items/${folderId}/children`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const filesData = await filesRes.json();
        
            const files = filesData.value.map((file: any) => ({
                id: file.id,
                name: file.name,
            }));
    
            return files;
        } catch (error) {
            await this.logService.createLog('error', 'one-drive.service.ts', 'listFiles', error.message);
            throw new HttpException(`Error al listar archivos: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}