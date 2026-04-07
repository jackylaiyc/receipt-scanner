export interface BudgetLimit {
  category: string;
  monthlyLimit: number;
}

export interface BudgetStatus {
  category: string;
  monthlyLimit: number;
  currentSpend: number;
  percentage: number;
  status: 'ok' | 'warning' | 'exceeded'; // <70% / 70-90% / >90%
}
