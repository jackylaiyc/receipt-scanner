'use client';

import { useState } from 'react';
import type { ParsedReceipt, Receipt, ExpenseType } from '@/types/receipt';
import CategoryPicker from './CategoryPicker';
import ExpenseTypePicker from './ExpenseTypePicker';
import { matchCategory } from '@/lib/utils/categoryMatcher';
import { Loader2, Save } from 'lucide-react';

interface ReceiptFormProps {
  parsedReceipt?: ParsedReceipt;
  expenseType: ExpenseType;
  imageBase64?: string;
  imageMimeType?: string;
  onSaved: () => void;
}

export default function ReceiptForm({
  parsedReceipt,
  expenseType: initialType,
  imageBase64,
  imageMimeType,
  onSaved,
}: ReceiptFormProps) {
  const [expenseType, setExpenseType] = useState<ExpenseType>(initialType);
  const [category, setCategory] = useState(
    parsedReceipt ? matchCategory(parsedReceipt.suggestedCategory, initialType) : 'Other'
  );
  const [merchantName, setMerchantName] = useState(parsedReceipt?.merchantName ?? '');
  const [date, setDate] = useState(parsedReceipt?.date ?? new Date().toISOString().split('T')[0]);
  const [total, setTotal] = useState(String(parsedReceipt?.total ?? ''));
  const [tax, setTax] = useState(String(parsedReceipt?.tax ?? '0'));
  const [tip, setTip] = useState(String(parsedReceipt?.tip ?? '0'));
  const [currency, setCurrency] = useState(parsedReceipt?.currency ?? 'USD');
  const [paymentMethod, setPaymentMethod] = useState(parsedReceipt?.paymentMethod ?? '');
  const [notes, setNotes] = useState('');
  // Family
  const [paidBy, setPaidBy] = useState('');
  const [splitWith, setSplitWith] = useState('');
  // Company
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [department, setDepartment] = useState('');
  const [isReimbursable, setIsReimbursable] = useState(false);
  const [taxDeductible, setTaxDeductible] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!merchantName || !date || !total) {
      setError('Merchant, date and total are required.');
      return;
    }
    setSaving(true);
    setError('');

    const receipt: Partial<Receipt> = {
      expenseType,
      category: category as Receipt['category'],
      merchantName,
      date,
      total: parseFloat(total) || 0,
      subtotal: parseFloat(total) || 0,
      tax: parseFloat(tax) || 0,
      tip: parseFloat(tip) || 0,
      currency,
      paymentMethod: paymentMethod || null,
      lineItems: parsedReceipt?.lineItems ?? [],
      receiptNumber: parsedReceipt?.receiptNumber ?? null,
      notes: notes || undefined,
      paidBy: expenseType === 'family' ? paidBy || undefined : undefined,
      splitWith: expenseType === 'family' ? splitWith || undefined : undefined,
      businessPurpose: expenseType === 'company' ? businessPurpose || undefined : undefined,
      projectCode: expenseType === 'company' ? projectCode || undefined : undefined,
      department: expenseType === 'company' ? department || undefined : undefined,
      isReimbursable: expenseType === 'company' ? isReimbursable : undefined,
      taxDeductible: expenseType === 'company' ? taxDeductible : undefined,
    };

    try {
      const res = await fetch('/api/receipts/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receipt, imageBase64, imageMimeType }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Save failed');
        return;
      }
      onSaved();
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500';
  const labelCls = 'block text-xs text-slate-400 mb-1';

  return (
    <div className="space-y-4">
      <ExpenseTypePicker value={expenseType} onChange={(t) => { setExpenseType(t); setCategory('Other'); }} />

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelCls}>Merchant *</label>
          <input className={inputCls} value={merchantName} onChange={(e) => setMerchantName(e.target.value)} placeholder="Store name" />
        </div>
        <div>
          <label className={labelCls}>Date *</label>
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Currency</label>
          <input className={inputCls} value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} placeholder="USD" maxLength={3} />
        </div>
        <div>
          <label className={labelCls}>Total *</label>
          <input type="number" step="0.01" className={inputCls} value={total} onChange={(e) => setTotal(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className={labelCls}>Tax</label>
          <input type="number" step="0.01" className={inputCls} value={tax} onChange={(e) => setTax(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className={labelCls}>Tip</label>
          <input type="number" step="0.01" className={inputCls} value={tip} onChange={(e) => setTip(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className={labelCls}>Payment Method</label>
          <input className={inputCls} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="Credit card" />
        </div>
      </div>

      <CategoryPicker value={category} onChange={setCategory} expenseType={expenseType} />

      {expenseType === 'family' && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/50 rounded-xl">
          <div>
            <label className={labelCls}>Paid By</label>
            <input className={inputCls} value={paidBy} onChange={(e) => setPaidBy(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className={labelCls}>Split With</label>
            <input className={inputCls} value={splitWith} onChange={(e) => setSplitWith(e.target.value)} placeholder="Name, Name..." />
          </div>
        </div>
      )}

      {expenseType === 'company' && (
        <div className="space-y-3 p-3 bg-slate-800/50 rounded-xl">
          <div>
            <label className={labelCls}>Business Purpose</label>
            <input className={inputCls} value={businessPurpose} onChange={(e) => setBusinessPurpose(e.target.value)} placeholder="Client lunch, Office supplies..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Department</label>
              <input className={inputCls} value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Sales" />
            </div>
            <div>
              <label className={labelCls}>Project Code</label>
              <input className={inputCls} value={projectCode} onChange={(e) => setProjectCode(e.target.value)} placeholder="PROJ-001" />
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={isReimbursable} onChange={(e) => setIsReimbursable(e.target.checked)} className="rounded" />
              Reimbursable
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input type="checkbox" checked={taxDeductible} onChange={(e) => setTaxDeductible(e.target.checked)} className="rounded" />
              Tax Deductible
            </label>
          </div>
        </div>
      )}

      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={inputCls + ' resize-none'} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." />
      </div>

      {parsedReceipt?.rawText && (
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer">Show raw OCR text</summary>
          <pre className="mt-2 p-2 bg-slate-800 rounded overflow-auto whitespace-pre-wrap">{parsedReceipt.rawText}</pre>
        </details>
      )}

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        {saving ? 'Saving...' : 'Save Receipt'}
      </button>
    </div>
  );
}
