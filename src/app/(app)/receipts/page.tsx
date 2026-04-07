'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { usePermissions } from '@/context/PermissionsContext';
import type { Receipt } from '@/types/receipt';
import { formatDate } from '@/lib/utils/dateHelpers';
import { Loader2, Search, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function ReceiptsPage() {
  const { canAccessCompany } = usePermissions();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'family' | 'company'>('family');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ type });
    if (search) params.set('merchant', search);
    fetch(`/api/receipts/list?${params}`)
      .then((r) => r.json())
      .then((d) => setReceipts(d.receipts ?? []))
      .finally(() => setLoading(false));
  }, [type, search]);

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Receipt History" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Type switcher */}
        {canAccessCompany && (
          <div className="flex rounded-lg bg-slate-800 p-1 gap-1">
            {(['family', 'company'] as const).map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${type === t ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                {t === 'family' ? '🏠 Family' : '💼 Company'}
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            placeholder="Search by merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
        ) : receipts.length === 0 ? (
          <p className="text-slate-500 text-center py-12">No receipts found.</p>
        ) : (
          <div className="space-y-2">
            {receipts.map((r) => (
              <Link key={r.id} href={`/receipts/${r.id}`}
                className="block bg-slate-800 rounded-xl p-4 hover:bg-slate-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{r.merchantName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{r.category} · {formatDate(r.date)}</p>
                    {r.submittedBy && <p className="text-xs text-slate-500 mt-0.5">{r.submittedBy}</p>}
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <p className="font-semibold text-white">${r.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500">{r.currency}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
