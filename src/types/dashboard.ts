export interface MonthlyData {
  month: string; // YYYY-MM
  label: string; // e.g. "Jan 2025"
  total: number;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MerchantBreakdown {
  merchant: string;
  total: number;
  count: number;
}

export interface DashboardStats {
  totalSpend: number;
  receiptCount: number;
  averageSpend: number;
  monthlyData: MonthlyData[];
  categoryBreakdown: CategoryBreakdown[];
  topMerchants: MerchantBreakdown[];
  // Company-specific
  reimbursableTotal?: number;
  taxDeductibleTotal?: number;
}
