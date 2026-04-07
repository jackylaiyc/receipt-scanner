// Single source of truth for column indices (0-based) in each spreadsheet

export const FAMILY_COLS = {
  ID: 0,
  DATE: 1,
  MERCHANT_NAME: 2,
  CATEGORY: 3,
  TOTAL_AMOUNT: 4,
  CURRENCY: 5,
  AMOUNT_USD: 6,
  TAX: 7,
  TIP: 8,
  PAYMENT_METHOD: 9,
  PAID_BY: 10,
  SPLIT_WITH: 11,
  NOTES: 12,
  IMAGE_URL: 13,
  ITEMS_SUMMARY: 14,
  SUBMITTED_BY: 15,
  CREATED_AT: 16,
} as const;

export const FAMILY_HEADERS = [
  'ID', 'Date', 'Merchant Name', 'Category', 'Total Amount', 'Currency',
  'Amount (USD)', 'Tax', 'Tip', 'Payment Method', 'Paid By', 'Split With',
  'Notes', 'Image URL', 'Items Summary', 'Submitted By', 'Created At',
];

export const COMPANY_COLS = {
  ID: 0,
  DATE: 1,
  MERCHANT_NAME: 2,
  CATEGORY: 3,
  DEPARTMENT: 4,
  PROJECT_CODE: 5,
  BUSINESS_PURPOSE: 6,
  TOTAL_AMOUNT: 7,
  CURRENCY: 8,
  AMOUNT_USD: 9,
  TAX: 10,
  PAYMENT_METHOD: 11,
  IS_REIMBURSABLE: 12,
  TAX_DEDUCTIBLE: 13,
  RECEIPT_NUMBER: 14,
  IMAGE_URL: 15,
  ITEMS_SUMMARY: 16,
  SUBMITTED_BY: 17,
  CREATED_AT: 18,
} as const;

export const COMPANY_HEADERS = [
  'ID', 'Date', 'Merchant Name', 'Category', 'Department', 'Project Code',
  'Business Purpose', 'Total Amount', 'Currency', 'Amount (USD)', 'Tax',
  'Payment Method', 'Is Reimbursable', 'Tax Deductible', 'Receipt Number',
  'Image URL', 'Items Summary', 'Submitted By', 'Created At',
];
