import { getSheetsClient } from './client';
import { FAMILY_COLS } from '@/constants/sheetColumns';
import type { Receipt } from '@/types/receipt';
import { initFamilySheet } from './sheetInit';

const SPREADSHEET_ID = () => process.env.FAMILY_SPREADSHEET_ID!;
const RANGE = 'Sheet1';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initFamilySheet();
    initialized = true;
  }
}

function receiptToRow(receipt: Receipt): string[] {
  const row: string[] = new Array(17).fill('');
  row[FAMILY_COLS.ID] = receipt.id;
  row[FAMILY_COLS.DATE] = receipt.date;
  row[FAMILY_COLS.MERCHANT_NAME] = receipt.merchantName;
  row[FAMILY_COLS.CATEGORY] = receipt.category;
  row[FAMILY_COLS.TOTAL_AMOUNT] = String(receipt.total);
  row[FAMILY_COLS.CURRENCY] = receipt.currency;
  row[FAMILY_COLS.AMOUNT_USD] = String(receipt.amountUSD ?? receipt.total);
  row[FAMILY_COLS.TAX] = String(receipt.tax ?? 0);
  row[FAMILY_COLS.TIP] = String(receipt.tip ?? 0);
  row[FAMILY_COLS.PAYMENT_METHOD] = receipt.paymentMethod ?? '';
  row[FAMILY_COLS.PAID_BY] = receipt.paidBy ?? '';
  row[FAMILY_COLS.SPLIT_WITH] = receipt.splitWith ?? '';
  row[FAMILY_COLS.NOTES] = receipt.notes ?? '';
  row[FAMILY_COLS.IMAGE_URL] = receipt.imageUrl ?? '';
  row[FAMILY_COLS.ITEMS_SUMMARY] = JSON.stringify(receipt.lineItems ?? []);
  row[FAMILY_COLS.SUBMITTED_BY] = receipt.submittedBy;
  row[FAMILY_COLS.CREATED_AT] = receipt.createdAt;
  return row;
}

function rowToReceipt(row: string[], rowIndex: number): Receipt {
  return {
    id: row[FAMILY_COLS.ID] ?? '',
    expenseType: 'family',
    category: row[FAMILY_COLS.CATEGORY] as Receipt['category'],
    merchantName: row[FAMILY_COLS.MERCHANT_NAME] ?? '',
    date: row[FAMILY_COLS.DATE] ?? '',
    total: parseFloat(row[FAMILY_COLS.TOTAL_AMOUNT]) || 0,
    currency: row[FAMILY_COLS.CURRENCY] ?? 'USD',
    amountUSD: parseFloat(row[FAMILY_COLS.AMOUNT_USD]) || 0,
    tax: parseFloat(row[FAMILY_COLS.TAX]) || 0,
    tip: parseFloat(row[FAMILY_COLS.TIP]) || 0,
    subtotal: parseFloat(row[FAMILY_COLS.TOTAL_AMOUNT]) || 0,
    paymentMethod: row[FAMILY_COLS.PAYMENT_METHOD] || null,
    paidBy: row[FAMILY_COLS.PAID_BY] || undefined,
    splitWith: row[FAMILY_COLS.SPLIT_WITH] || undefined,
    notes: row[FAMILY_COLS.NOTES] || undefined,
    imageUrl: row[FAMILY_COLS.IMAGE_URL] || undefined,
    lineItems: (() => { try { return JSON.parse(row[FAMILY_COLS.ITEMS_SUMMARY]); } catch { return []; } })(),
    submittedBy: row[FAMILY_COLS.SUBMITTED_BY] ?? '',
    createdAt: row[FAMILY_COLS.CREATED_AT] ?? '',
    sheetRowIndex: rowIndex,
  };
}

export async function appendFamilyRow(receipt: Receipt): Promise<number> {
  await ensureInit();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${RANGE}!A:Q`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [receiptToRow(receipt)] },
  });
  const updatedRange = res.data.updates?.updatedRange ?? '';
  const match = updatedRange.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : -1;
}

export interface FamilyFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  merchant?: string;
  submittedBy?: string;
  page?: number;
  limit?: number;
}

export async function getFamilyRows(filters: FamilyFilters = {}): Promise<Receipt[]> {
  await ensureInit();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${RANGE}!A2:Q`,
  });
  const rows = res.data.values ?? [];
  let receipts = rows
    .map((row, i) => rowToReceipt(row as string[], i + 2))
    .filter((r) => r.id); // skip empty rows

  if (filters.category) receipts = receipts.filter((r) => r.category === filters.category);
  if (filters.merchant) receipts = receipts.filter((r) => r.merchantName.toLowerCase().includes(filters.merchant!.toLowerCase()));
  if (filters.submittedBy) receipts = receipts.filter((r) => r.submittedBy === filters.submittedBy);
  if (filters.dateFrom) receipts = receipts.filter((r) => r.date >= filters.dateFrom!);
  if (filters.dateTo) receipts = receipts.filter((r) => r.date <= filters.dateTo!);

  // Sort newest first
  receipts.sort((a, b) => b.date.localeCompare(a.date));

  const limit = filters.limit ?? 50;
  const page = filters.page ?? 1;
  return receipts.slice((page - 1) * limit, page * limit);
}

export async function getAllFamilyRows(): Promise<Receipt[]> {
  await ensureInit();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${RANGE}!A2:Q`,
  });
  const rows = res.data.values ?? [];
  return rows
    .map((row, i) => rowToReceipt(row as string[], i + 2))
    .filter((r) => r.id);
}
