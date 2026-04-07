import { getSheetsClient } from './client';
import { FAMILY_HEADERS, COMPANY_HEADERS } from '@/constants/sheetColumns';

async function ensureHeaderRow(spreadsheetId: string, headers: string[]) {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Sheet1!A1:Z1',
  });
  const existingRow = res.data.values?.[0];
  if (!existingRow || existingRow.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }
}

export async function initFamilySheet() {
  await ensureHeaderRow(process.env.FAMILY_SPREADSHEET_ID!, FAMILY_HEADERS);
}

export async function initCompanySheet() {
  await ensureHeaderRow(process.env.COMPANY_SPREADSHEET_ID!, COMPANY_HEADERS);
}
