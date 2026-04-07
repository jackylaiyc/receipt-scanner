import { google } from 'googleapis';

let _sheetsClient: ReturnType<typeof google.sheets> | null = null;
let _driveClient: ReturnType<typeof google.drive> | null = null;

function getJwtAuth() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!,
    key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
  return auth;
}

export function getSheetsClient() {
  if (!_sheetsClient) {
    _sheetsClient = google.sheets({ version: 'v4', auth: getJwtAuth() });
  }
  return _sheetsClient;
}

export function getDriveClient() {
  if (!_driveClient) {
    _driveClient = google.drive({ version: 'v3', auth: getJwtAuth() });
  }
  return _driveClient;
}
