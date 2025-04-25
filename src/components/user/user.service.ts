import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { poolPromise } from "src/configurations/sql-server/sql.configuration";
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class UserService {
    async findByUserName(username: string) {
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
        
        if(result.recordset.lenth === 0) {
            throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
        }

        return result.recordset[0];
    }
}