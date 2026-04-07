'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import type { Receipt } from '@/types/receipt';
import { formatDate } from '@/lib/utils/dateHelpers';
import { ExternalLink, Loader2 } from 'lucide-react';

export default function ReceiptDetailPage() {
  const params = useParams();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from list and find by ID (simple approach)
    Promise.all([
      fetch('/api/receipts/list?type=family&limit=1000').then((r) => r.json()),
      fetch('/api/receipts/list?type=company&limit=1000').then((r) => r.json()).catch(() => ({ receipts: [] })),
    ]).then(([family, company]) => {
      const all = [...(family.receipts ?? []), ...(company.receipts ?? [])];
      const found = all.find((r: Receipt) => r.id === params.id);
      setReceipt(found ?? null);
    }).finally(() => setLoading(false));
  }, [params.id]);

  const row = (label: string, value?: string | number | null | boolean) => value !== undefined && value !== null && value !== '' && (
    <div className="flex justify-between py-2 border-b border-slate-800 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-white text-right max-w-[60%]">{String(value)}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Receipt Detail" showBack />
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
      ) : !receipt ? (
        <p className="text-slate-400 text-center py-16">Receipt not found.</p>
      ) : (
        <div className="px-4 py-6 max-w-lg mx-auto space-y-4">
          {receipt.imageUrl && (
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <iframe src={receipt.imageUrl} title="Receipt image" className="w-full h-64" />
              <a href={receipt.imageUrl} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2 text-sm text-indigo-400 hover:text-indigo-300">
                <ExternalLink size={14} /> Open in Drive
              </a>
            </div>
          )}
          <div className="bg-slate-800 rounded-xl p-4 space-y-0.5">
            {row('Merchant', receipt.merchantName)}
            {row('Date', formatDate(receipt.date))}
            {row('Category', receipt.category)}
            {row('Total', `${receipt.currency} ${receipt.total.toFixed(2)}`)}
            {receipt.amountUSD && receipt.currency !== 'USD' && row('Amount (USD)', `$${receipt.amountUSD.toFixed(2)}`)}
            {row('Tax', receipt.tax ? `$${receipt.tax.toFixed(2)}` : null)}
            {row('Tip', receipt.tip ? `$${receipt.tip.toFixed(2)}` : null)}
            {row('Payment', receipt.paymentMethod)}
            {row('Paid By', receipt.paidBy)}
            {row('Split With', receipt.splitWith)}
            {row('Business Purpose', receipt.businessPurpose)}
            {row('Department', receipt.department)}
            {row('Project Code', receipt.projectCode)}
            {receipt.expenseType === 'company' && row('Reimbursable', receipt.isReimbursable ? 'Yes' : 'No')}
            {receipt.expenseType === 'company' && row('Tax Deductible', receipt.taxDeductible ? 'Yes' : 'No')}
            {row('Notes', receipt.notes)}
            {row('Submitted By', receipt.submittedBy)}
          </div>
          {receipt.lineItems?.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-medium text-slate-300 mb-3">Items</h3>
              {receipt.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-slate-700 last:border-0">
                  <span className="text-slate-300">{item.description}</span>
                  <span className="text-white">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
