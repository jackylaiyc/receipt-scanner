'use client';

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { MonthlyData } from '@/types/dashboard';

interface Props { data: MonthlyData[] }

export default function MonthlyTrendChart({ data }: Props) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">6-Month Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `$${v}`} />
          <Tooltip
            formatter={(v: number) => `$${v.toFixed(2)}`}
            contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:'8px' }}
          />
          <Bar dataKey="total" fill="#6366f1" radius={[4,4,0,0]} name="Spending" />
          <Line dataKey="total" stroke="#818cf8" dot={false} strokeWidth={2} name="Trend" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
