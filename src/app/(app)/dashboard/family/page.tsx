'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import StatCard from '@/components/dashboard/StatCard';
import SpendingByCategory from '@/components/dashboard/SpendingByCategory';
import MonthlyTrendChart from '@/components/dashboard/MonthlyTrendChart';
import TopMerchants from '@/components/dashboard/TopMerchants';
import type { DashboardStats } from '@/types/dashboard';
import { Loader2 } from 'lucide-react';

export default function FamilyDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/family')
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="🏠 Family Expenses" />
      <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={32} className="animate-spin text-indigo-400" /></div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="This Month" value={`$${stats.totalSpend.toFixed(2)}`} icon="💰" />
              <StatCard label="Receipts" value={String(stats.receiptCount)} sub="this month" icon="🧾" />
              <StatCard label="Average" value={`$${stats.averageSpend.toFixed(2)}`} sub="per receipt" icon="📊" />
            </div>
            <MonthlyTrendChart data={stats.monthlyData} />
            <SpendingByCategory data={stats.categoryBreakdown} />
            <TopMerchants data={stats.topMerchants} />
          </>
        ) : (
          <p className="text-slate-400 text-center py-16">No data yet. Scan your first receipt!</p>
        )}
      </div>
    </div>
  );
}
