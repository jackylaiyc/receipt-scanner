'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import BatchUploadZone, { type BatchFile } from '@/components/camera/BatchUploadZone';
import ReceiptForm from '@/components/receipt/ReceiptForm';
import { fileToBase64 } from '@/lib/utils/imageToBase64';
import type { ParsedReceipt } from '@/types/receipt';
import { usePermissions } from '@/context/PermissionsContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface BatchResult {
  file: BatchFile;
  status: 'pending' | 'scanning' | 'success' | 'error' | 'saved';
  parsedReceipt?: ParsedReceipt;
  error?: string;
  base64?: string;
  mimeType?: string;
}

export default function BatchPage() {
  const { canAccessCompany } = usePermissions();
  const [results, setResults] = useState<BatchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [scanning, setScanning] = useState(false);

  async function handleFilesSelected(files: BatchFile[]) {
    const initial: BatchResult[] = files.map((f) => ({ file: f, status: 'pending' }));
    setResults(initial);
    setScanning(true);

    for (let i = 0; i < files.length; i++) {
      setResults((prev) => prev.map((r, idx) => idx === i ? { ...r, status: 'scanning' } : r));

      const { base64, mimeType } = await fileToBase64(files[i].file);

      const res = await fetch('/api/receipts/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType, expenseType: files[i].expenseType }),
      });
      const result = await res.json();

      setResults((prev) => prev.map((r, idx) =>
        idx === i ? {
          ...r,
          status: result.success ? 'success' : 'error',
          parsedReceipt: result.success ? result.data : undefined,
          error: !result.success ? result.error : undefined,
          base64,
          mimeType,
        } : r
      ));

      // Rate limit pause between scans
      if (i < files.length - 1) await new Promise((r) => setTimeout(r, 4000));
    }
    setScanning(false);
    setActiveIndex(results.findIndex((r) => r.status === 'success'));
  }

  function markSaved(index: number) {
    setResults((prev) => prev.map((r, i) => i === index ? { ...r, status: 'saved' } : r));
    // Open next unsaved
    const nextIdx = results.findIndex((r, i) => i > index && r.status === 'success');
    setActiveIndex(nextIdx >= 0 ? nextIdx : null);
  }

  const statusIcon = (s: BatchResult['status']) => {
    if (s === 'scanning') return <Loader2 size={16} className="animate-spin text-indigo-400" />;
    if (s === 'success') return <div className="w-4 h-4 rounded-full bg-amber-500" />;
    if (s === 'saved') return <CheckCircle size={16} className="text-green-500" />;
    if (s === 'error') return <XCircle size={16} className="text-red-500" />;
    return <div className="w-4 h-4 rounded-full bg-slate-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Batch Upload" />
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">
        {results.length === 0 ? (
          <BatchUploadZone onFilesSelected={handleFilesSelected} canAccessCompany={canAccessCompany} />
        ) : (
          <>
            {scanning && (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Scanning receipts... please wait
              </div>
            )}
            <div className="space-y-2">
              {results.map((r, i) => (
                <button
                  key={i}
                  onClick={() => r.status === 'success' ? setActiveIndex(i) : null}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                    activeIndex === i ? 'bg-indigo-900/40 border border-indigo-700' : 'bg-slate-800'
                  } ${r.status === 'success' ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  <img src={r.file.preview} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{r.file.file.name}</p>
                    {r.parsedReceipt && <p className="text-xs text-slate-400">{r.parsedReceipt.merchantName} · ${r.parsedReceipt.total}</p>}
                    {r.error && <p className="text-xs text-red-400">{r.error}</p>}
                  </div>
                  {statusIcon(r.status)}
                </button>
              ))}
            </div>

            {activeIndex !== null && results[activeIndex]?.status === 'success' && (
              <div className="border border-slate-700 rounded-xl p-4">
                <p className="text-sm text-slate-400 mb-3">Review receipt {activeIndex + 1}</p>
                <ReceiptForm
                  parsedReceipt={results[activeIndex].parsedReceipt}
                  expenseType={results[activeIndex].file.expenseType}
                  imageBase64={results[activeIndex].base64}
                  imageMimeType={results[activeIndex].mimeType}
                  onSaved={() => markSaved(activeIndex)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
