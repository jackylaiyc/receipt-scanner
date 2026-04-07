import { FAMILY_CATEGORIES, COMPANY_CATEGORIES } from '@/constants/categories';

export function matchCategory(suggested: string, expenseType: 'family' | 'company'): string {
  const categories = expenseType === 'family' ? FAMILY_CATEGORIES : COMPANY_CATEGORIES;
  const normalized = suggested?.toLowerCase().trim() ?? '';

  // Exact match first
  const exact = categories.find((c) => c.value.toLowerCase() === normalized);
  if (exact) return exact.value;

  // Partial match
  const partial = categories.find((c) => c.value.toLowerCase().includes(normalized) || normalized.includes(c.value.toLowerCase()));
  if (partial) return partial.value;

  return 'Other';
}
