import { Injectable, NotFoundException } from "@nestjs/common";
import { poolPromise } from "src/configurations/sql-server/sql.configuration";

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
                LTRIM(RTRIM(dbo.desencriptar(AUsrDsc))) AS description, 
                LTRIM(RTRIM(dbo.desencriptar(AUsrPsw))) AS password, 
                LTRIM(RTRIM(AgrpId)) AS grupoId
                FROM ADMUSR 
                WHERE dbo.desencriptar(AUsrId) = @username
                AND AUsrEst <> 'N'
            `);
        
        if(result.recordset.lenth === 0) {
            throw new NotFoundException('Usuario no encontrado o desactivado.');
        }

        return result.recordset[0];
    }
}