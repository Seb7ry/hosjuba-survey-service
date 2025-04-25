import sql from 'mssql';
import 'dotenv/config';

const sql = require('mssql');
const config: sql.config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST!,
  database: process.env.DB_DATABASE,
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',         
    enableArithAbort: process.env.DB_ENABLE_ARITH_ABORT === 'true',
    trustServerCertificate: true,                       
  },
};

export const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('✅ Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('❌ Error al conectar a SQL Server', err);
    throw err;
  });

export default sql;