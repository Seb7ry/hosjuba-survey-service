import { JWT } from 'google-auth-library';
import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs';
require('dotenv').config();

const credentialsPath = path.join(__dirname, '../../credentials/google-drive-sa.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

const auth = new JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });

async function healthCheck() {
  try {
    const parentId = process.env.GOOGLE_DRIVE_TEMPLATES_ID;
    const res = await drive.files.list({
      q: `'${parentId}' in parents`, 
      fields: 'files(id, name)', 
    });

    console.log('Archivos en Google Drive:', res.data.files);
    return res.data.files;
  } catch (error) {
    console.error('Error al listar archivos en Google Drive:', error);
  }
}

healthCheck().catch(console.error);

export default drive;
