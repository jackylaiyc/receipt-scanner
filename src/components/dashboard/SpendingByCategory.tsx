'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryBreakdown } from '@/types/dashboard';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6','#f97316'];

interface Props { data: CategoryBreakdown[] }

export default function SpendingByCategory({ data }: Props) {
  if (!data.length) return <div className="text-slate-500 text-sm text-center py-8">No data this month</div>;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'8px' }} />
          <Legend formatter={(v) => <span className="text-xs text-slate-300">{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
