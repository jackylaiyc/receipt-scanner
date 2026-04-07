import { format, parseISO, startOfMonth, subMonths } from 'date-fns';

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function getMonthLabel(dateStr: string): string {
  try {
    return format(parseISO(dateStr + '-01'), 'MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function getLast6Months(): string[] {
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(startOfMonth(new Date()), i);
    months.push(format(d, 'yyyy-MM'));
  }
  return months;
}

export function getCurrentMonth(): string {
  return format(startOfMonth(new Date()), 'yyyy-MM');
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
