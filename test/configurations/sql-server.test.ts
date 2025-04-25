import { poolPromise } from '../../src/configurations/sql-server/sql.configuration';

async function testConnection() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT TOP 1 * FROM INGRESOS');
    console.log('📄 Registros en INGRESOS:', result.recordset);
    return result.recordset;
  } catch (error) {
    console.error('❌ Error al consultar la tabla INGRESOS:', error);
  }
}

testConnection();
