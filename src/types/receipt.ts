export type ExpenseType = 'family' | 'company';

export type FamilyCategory =
  | 'Groceries'
  | 'Dining Out'
  | 'Gas & Fuel'
  | 'Utilities'
  | 'Healthcare'
  | 'Entertainment'
  | 'Clothing'
  | 'Home & Garden'
  | 'Education'
  | 'Travel'
  | 'Subscriptions'
  | 'Personal Care'
  | 'Pet Care'
  | 'Kids & Baby'
  | 'Auto & Transport'
  | 'Gifts & Donations'
  | 'Insurance'
  | 'Other';

export type CompanyCategory =
  | 'Meals & Entertainment'
  | 'Travel & Lodging'
  | 'Office Supplies'
  | 'Software & Subscriptions'
  | 'Equipment & Hardware'
  | 'Professional Services'
  | 'Marketing & Advertising'
  | 'Training & Education'
  | 'Utilities'
  | 'Shipping & Postage'
  | 'Vehicle & Mileage'
  | 'Telecommunications'
  | 'Insurance'
  | 'Contractor Payments'
  | 'Bank Fees'
  | 'Rent & Lease'
  | 'Other';

export interface ReceiptLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SplitExpense {
  paidBy: string;
  splitWith: string[];
  splitMethod: 'equal' | 'custom';
  amounts: Record<string, number>;
}

export interface ParsedReceipt {
  merchantName: string;
  merchantAddress?: string | null;
  date: string;
  lineItems: ReceiptLineItem[];
  subtotal: number;
  tax: number;
  tip?: number | null;
  total: number;
  currency: string;
  paymentMethod?: string | null;
  receiptNumber?: string | null;
  suggestedCategory: string;
  confidence: number;
  rawText?: string;
}

export interface Receipt {
  id: string;
  expenseType: ExpenseType;
  category: FamilyCategory | CompanyCategory;
  merchantName: string;
  merchantAddress?: string | null;
  date: string;
  lineItems: ReceiptLineItem[];
  subtotal: number;
  tax: number;
  tip?: number | null;
  total: number;
  amountUSD?: number;
  currency: string;
  paymentMethod?: string | null;
  receiptNumber?: string | null;
  notes?: string;
  imageUrl?: string;
  // Family-specific
  paidBy?: string;
  splitWith?: string;
  split?: SplitExpense;
  // Company-specific
  businessPurpose?: string;
  projectCode?: string;
  department?: string;
  isReimbursable?: boolean;
  taxDeductible?: boolean;
  // Metadata
  submittedBy: string;
  createdAt: string;
  sheetRowIndex?: number;
}
