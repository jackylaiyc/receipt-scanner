'use client';

import type { MerchantBreakdown } from '@/types/dashboard';

interface Props { data: MerchantBreakdown[] }

export default function TopMerchants({ data }: Props) {
  if (!data.length) return null;
  const max = data[0].total;

  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">Top Merchants</h3>
      <div className="space-y-3">
        {data.map((m) => (
          <div key={m.merchant}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300 truncate">{m.merchant}</span>
              <span className="text-white font-medium ml-2 flex-shrink-0">${m.total.toFixed(2)}</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(m.total / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
