import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { poolPromise } from "src/configurations/sql-server/sql.configuration";
import * as dotenv from 'dotenv';
import { LogService } from "../log/log.service";
dotenv.config();

@Injectable()
export class UserService {
    constructor(private readonly logService: LogService){ }

    async findByUserName(username: string) {
        try {
            if (!username || username.trim() === '') {
                await this.logService.createLog('warning', 'user.service.ts', 'findByUserName',  `Usuario no digitado.`);
                throw new HttpException('El nombre de usuario es requerido.', HttpStatus.BAD_REQUEST);
            }            

            const pool = await poolPromise;
            const result = await pool
                .request()
                .input('username', username)
                .query(`
                    SELECT 
                    LTRIM(RTRIM(dbo.desencriptar(AUsrId))) AS username, 
                    LTRIM(RTRIM(dbo.desencriptar(AUsrDsc))) AS name, 
                    LTRIM(RTRIM(dbo.desencriptar(AUsrPsw))) AS password, 
                    LTRIM(RTRIM(AgrpId)) AS groupp
                    FROM ADMUSR 
                    WHERE dbo.desencriptar(AUsrId) = @username
                    AND AUsrEst <> 'N'
                `);
            
            if(result.recordset.length === 0) {
                await this.logService.createLog('warning', 'user.service.ts', 'findByUserName', `Usuario ${username} no encontrado`);
                throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
            }   
            
            return result.recordset[0];
        } catch(e) {
            await this.logService.createLog('error', 'user.service.ts', 'findByUserName', `Error buscando usuario: ${e.message}`);
            throw new HttpException(`Error buscando usuario: ${e.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}