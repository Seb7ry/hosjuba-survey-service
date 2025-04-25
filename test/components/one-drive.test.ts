import fetch from 'node-fetch';
import 'dotenv/config';

const {
  AZURE_CLIENT_ID,
  AZURE_TENANT_ID,
  AZURE_CLIENT_SECRET,
  ONE_DRIVE_ID,
  ONE_DRIVE_FOLDER_NAME,
} = process.env;

const GRAPH = 'https://graph.microsoft.com/v1.0';

async function getAccessToken() {
  const res = await fetch(`https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    body: new URLSearchParams({
      client_id: AZURE_CLIENT_ID!,
      scope: 'https://graph.microsoft.com/.default',
      client_secret: AZURE_CLIENT_SECRET!,
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json();
  return data.access_token;
}

async function healthCheck() {
  try {
    const token = await getAccessToken();

    const folderRes = await fetch(`${GRAPH}/drives/${ONE_DRIVE_ID}/root/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const folderData = await folderRes.json();
    const folderId = folderData.value.find((item: any) => item.name === ONE_DRIVE_FOLDER_NAME && item.folder)?.id;

    if (!folderId) throw new Error('No se encontró la carpeta');

    const res = await fetch(`${GRAPH}/drives/${ONE_DRIVE_ID}/items/${folderId}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    const files = data.value.map((file: any) => ({
      id: file.id,
      name: file.name,
    }));

    console.log('Archivos en OneDrive:', files);
    return files;
  } catch (error) {
    console.error('Error al listar archivos en OneDrive:', error);
  }
}

healthCheck().catch(console.error);

export default healthCheck;