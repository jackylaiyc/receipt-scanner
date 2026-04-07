import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/authInstance';
import { isCompanyUser } from '@/lib/auth/permissions';
import { getAllCompanyRows } from '@/lib/sheets/companySheet';
import { getLast6Months, getCurrentMonth, getMonthLabel } from '@/lib/utils/dateHelpers';
import type { DashboardStats } from '@/types/dashboard';

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isCompanyUser(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const receipts = await getAllCompanyRows();
  const months = getLast6Months();
  const currentMonth = getCurrentMonth();

  const monthlyData = months.map((month) => {
    const monthReceipts = receipts.filter((r) => r.date.startsWith(month));
    return {
      month,
      label: getMonthLabel(month),
      total: monthReceipts.reduce((sum, r) => sum + (r.amountUSD ?? r.total), 0),
      count: monthReceipts.length,
    };
  });

  const currentMonthReceipts = receipts.filter((r) => r.date.startsWith(currentMonth));
  const totalCurrentMonth = currentMonthReceipts.reduce((sum, r) => sum + (r.amountUSD ?? r.total), 0);

  const categoryMap = new Map<string, { total: number; count: number }>();
  currentMonthReceipts.forEach((r) => {
    const entry = categoryMap.get(r.category) ?? { total: 0, count: 0 };
    entry.total += r.amountUSD ?? r.total;
    entry.count += 1;
    categoryMap.set(r.category, entry);
  });

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalCurrentMonth > 0 ? (data.total / totalCurrentMonth) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const merchantMap = new Map<string, { total: number; count: number }>();
  currentMonthReceipts.forEach((r) => {
    const entry = merchantMap.get(r.merchantName) ?? { total: 0, count: 0 };
    entry.total += r.amountUSD ?? r.total;
    entry.count += 1;
    merchantMap.set(r.merchantName, entry);
  });

  const topMerchants = Array.from(merchantMap.entries())
    .map(([merchant, data]) => ({ merchant, total: data.total, count: data.count }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const reimbursableTotal = currentMonthReceipts.filter((r) => r.isReimbursable).reduce((sum, r) => sum + (r.amountUSD ?? r.total), 0);
  const taxDeductibleTotal = currentMonthReceipts.filter((r) => r.taxDeductible).reduce((sum, r) => sum + (r.amountUSD ?? r.total), 0);

  const stats: DashboardStats = {
    totalSpend: totalCurrentMonth,
    receiptCount: currentMonthReceipts.length,
    averageSpend: currentMonthReceipts.length > 0 ? totalCurrentMonth / currentMonthReceipts.length : 0,
    monthlyData,
    categoryBreakdown,
    topMerchants,
    reimbursableTotal,
    taxDeductibleTotal,
  };

  return NextResponse.json(stats);
}
