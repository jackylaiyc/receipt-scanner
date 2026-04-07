'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import SpendingByCategory from '@/components/dashboard/SpendingByCategory';
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart';
import TopMerchants from '@/components/dashboard/TopMerchants';
import { usePermissions } from '@/context/PermissionsContext';
import type { DashboardStats } from '@/types/dashboard';
import { Loader2 } from 'lucide-react';

export default function CompanyDashboard() {
  const { canAccessCompany, loading: permLoading } = usePermissions();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!permLoading && !canAccessCompany) {
      router.replace('/dashboard/family');
      return;
    }
    if (!permLoading && canAccessCompany) {
      fetch('/api/dashboard/company')
        .then((r) => r.json())
        .then(setStats)
        .finally(() => setLoading(false));
    }
  }, [canAccessCompany, permLoading, router]);

  if (permLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="💼 Company Expenses" />
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {stats ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="This Month" value={`$${stats.totalSpend.toFixed(2)}`} icon="💰" />
              <StatCard label="Receipts" value={String(stats.receiptCount)} sub="this month" icon="🧾" />
              <StatCard label="Reimbursable" value={`$${(stats.reimbursableTotal ?? 0).toFixed(2)}`} icon="💳" />
              <StatCard label="Tax Deductible" value={`$${(stats.taxDeductibleTotal ?? 0).toFixed(2)}`} icon="📋" />
            </div>
            <MonthlyTrendChart data={stats.monthlyData} />
            <SpendingByCategory data={stats.categoryBreakdown} />
            <TopMerchants data={stats.topMerchants} />
          </>
        ) : (
          <p className="text-slate-400 text-center py-16">No company data yet.</p>
        )}
      </div>
    </div>
  );
}
