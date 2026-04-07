import { getSheetsClient } from './client';
import { COMPANY_COLS } from '@/constants/sheetColumns';
import type { Receipt } from '@/types/receipt';
import { initCompanySheet } from './sheetInit';

const SPREADSHEET_ID = () => process.env.COMPANY_SPREADSHEET_ID!;
const RANGE = 'Sheet1';

let initialized = false;
async function ensureInit() {
  if (!initialized) {
    await initCompanySheet();
    initialized = true;
  }
}

function receiptToRow(receipt: Receipt): string[] {
  const row: string[] = new Array(19).fill('');
  row[COMPANY_COLS.ID] = receipt.id;
  row[COMPANY_COLS.DATE] = receipt.date;
  row[COMPANY_COLS.MERCHANT_NAME] = receipt.merchantName;
  row[COMPANY_COLS.CATEGORY] = receipt.category;
  row[COMPANY_COLS.DEPARTMENT] = receipt.department ?? '';
  row[COMPANY_COLS.PROJECT_CODE] = receipt.projectCode ?? '';
  row[COMPANY_COLS.BUSINESS_PURPOSE] = receipt.businessPurpose ?? '';
  row[COMPANY_COLS.TOTAL_AMOUNT] = String(receipt.total);
  row[COMPANY_COLS.CURRENCY] = receipt.currency;
  row[COMPANY_COLS.AMOUNT_USD] = String(receipt.amountUSD ?? receipt.total);
  row[COMPANY_COLS.TAX] = String(receipt.tax ?? 0);
  row[COMPANY_COLS.PAYMENT_METHOD] = receipt.paymentMethod ?? '';
  row[COMPANY_COLS.IS_REIMBURSABLE] = receipt.isReimbursable ? 'TRUE' : 'FALSE';
  row[COMPANY_COLS.TAX_DEDUCTIBLE] = receipt.taxDeductible ? 'TRUE' : 'FALSE';
  row[COMPANY_COLS.RECEIPT_NUMBER] = receipt.receiptNumber ?? '';
  row[COMPANY_COLS.IMAGE_URL] = receipt.imageUrl ?? '';
  row[COMPANY_COLS.ITEMS_SUMMARY] = JSON.stringify(receipt.lineItems ?? []);
  row[COMPANY_COLS.SUBMITTED_BY] = receipt.submittedBy;
  row[COMPANY_COLS.CREATED_AT] = receipt.createdAt;
  return row;
}

function rowToReceipt(row: string[], rowIndex: number): Receipt {
  return {
    id: row[COMPANY_COLS.ID] ?? '',
    expenseType: 'company',
    category: row[COMPANY_COLS.CATEGORY] as Receipt['category'],
    merchantName: row[COMPANY_COLS.MERCHANT_NAME] ?? '',
    date: row[COMPANY_COLS.DATE] ?? '',
    total: parseFloat(row[COMPANY_COLS.TOTAL_AMOUNT]) || 0,
    currency: row[COMPANY_COLS.CURRENCY] ?? 'USD',
    amountUSD: parseFloat(row[COMPANY_COLS.AMOUNT_USD]) || 0,
    tax: parseFloat(row[COMPANY_COLS.TAX]) || 0,
    subtotal: parseFloat(row[COMPANY_COLS.TOTAL_AMOUNT]) || 0,
    paymentMethod: row[COMPANY_COLS.PAYMENT_METHOD] || null,
    department: row[COMPANY_COLS.DEPARTMENT] || undefined,
    projectCode: row[COMPANY_COLS.PROJECT_CODE] || undefined,
    businessPurpose: row[COMPANY_COLS.BUSINESS_PURPOSE] || undefined,
    isReimbursable: row[COMPANY_COLS.IS_REIMBURSABLE] === 'TRUE',
    taxDeductible: row[COMPANY_COLS.TAX_DEDUCTIBLE] === 'TRUE',
    receiptNumber: row[COMPANY_COLS.RECEIPT_NUMBER] || null,
    imageUrl: row[COMPANY_COLS.IMAGE_URL] || undefined,
    lineItems: (() => { try { return JSON.parse(row[COMPANY_COLS.ITEMS_SUMMARY]); } catch { return []; } })(),
    submittedBy: row[COMPANY_COLS.SUBMITTED_BY] ?? '',
    createdAt: row[COMPANY_COLS.CREATED_AT] ?? '',
    sheetRowIndex: rowIndex,
  };
}

export async function appendCompanyRow(receipt: Receipt): Promise<number> {
  await ensureInit();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${RANGE}!A:S`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [receiptToRow(receipt)] },
  });
  const updatedRange = res.data.updates?.updatedRange ?? '';
  const match = updatedRange.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : -1;
}

export interface CompanyFilters {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  merchant?: string;
  submittedBy?: string;
  isReimbursable?: boolean;
  taxDeductible?: boolean;
  page?: number;
  limit?: number;
}

export async function getCompanyRows(filters: CompanyFilters = {}): Promise<Receipt[]> {
  await ensureInit();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${RANGE}!A2:S`,
  });
  const rows = res.data.values ?? [];
  let receipts = rows
    .map((row, i) => rowToReceipt(row as string[], i + 2))
    .filter((r) => r.id);

  if (filters.category) receipts = receipts.filter((r) => r.category === filters.category);
  if (filters.merchant) receipts = receipts.filter((r) => r.merchantName.toLowerCase().includes(filters.merchant!.toLowerCase()));
  if (filters.submittedBy) receipts = receipts.filter((r) => r.submittedBy === filters.submittedBy);
  if (filters.dateFrom) receipts = receipts.filter((r) => r.date >= filters.dateFrom!);
  if (filters.dateTo) receipts = receipts.filter((r) => r.date <= filters.dateTo!);
  if (filters.isReimbursable !== undefined) receipts = receipts.filter((r) => r.isReimbursable === filters.isReimbursable);
  if (filters.taxDeductible !== undefined) receipts = receipts.filter((r) => r.taxDeductible === filters.taxDeductible);

  receipts.sort((a, b) => b.date.localeCompare(a.date));

  const limit = filters.limit ?? 50;
  const page = filters.page ?? 1;
  return receipts.slice((page - 1) * limit, page * limit);
}

export async function getAllCompanyRows(): Promise<Receipt[]> {
  await ensureInit();
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID(),
    range: `${RANGE}!A2:S`,
  });
  const rows = res.data.values ?? [];
  return rows
    .map((row, i) => rowToReceipt(row as string[], i + 2))
    .filter((r) => r.id);
}
