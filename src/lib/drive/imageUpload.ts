import { getDriveClient } from '@/lib/sheets/client';
import { Readable } from 'stream';

export async function uploadReceiptImage(
  base64: string,
  mimeType: string,
  filename: string
): Promise<string> {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

  const buffer = Buffer.from(base64, 'base64');
  const stream = Readable.from(buffer);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
      mimeType,
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink',
  });

  const fileId = res.data.id!;

  // Make publicly viewable (anyone with the link)
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  return res.data.webViewLink ?? `https://drive.google.com/file/d/${fileId}/view`;
}
