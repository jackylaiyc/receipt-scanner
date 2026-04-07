'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from '@/components/camera/CameraCapture';
import ImagePreview from '@/components/camera/ImagePreview';
import ReceiptForm from '@/components/receipt/ReceiptForm';
import Header from '@/components/layout/Header';
import { fileToBase64 } from '@/lib/utils/imageToBase64';
import type { ParsedReceipt, ExpenseType } from '@/types/receipt';
import { Loader2 } from 'lucide-react';

type Stage = 'capture' | 'scanning' | 'review';

export default function CapturePage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [expenseType] = useState<ExpenseType>('family');
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | undefined>();
  const [scanError, setScanError] = useState('');
  const [toast, setToast] = useState('');

  const handleCapture = useCallback(async (file: File) => {
    setScanError('');
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setStage('scanning');

    const { base64, mimeType } = await fileToBase64(file);
    setImageBase64(base64);
    setImageMimeType(mimeType);

    const res = await fetch('/api/receipts/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64, mimeType, expenseType }),
    });
    const result = await res.json();

    if (result.success) {
      setParsedReceipt(result.data);
    } else {
      setScanError("Couldn't read receipt automatically — please fill in manually.");
      setParsedReceipt(undefined);
    }
    setStage('review');
  }, [expenseType]);

  function handleRetake() {
    setStage('capture');
    setImagePreview(null);
    setImageBase64(null);
    setParsedReceipt(undefined);
    setScanError('');
  }

  function handleSaved() {
    setToast('Receipt saved!');
    setTimeout(() => {
      setToast('');
      router.push('/dashboard/family');
    }, 1500);
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title={stage === 'review' ? 'Review Receipt' : 'Scan Receipt'} showBack={stage === 'review'} />

      <div className="px-4 py-6 max-w-lg mx-auto">
        {stage === 'capture' && (
          <CameraCapture onCapture={handleCapture} />
        )}

        {stage === 'scanning' && (
          <div className="space-y-6">
            {imagePreview && <ImagePreview src={imagePreview} onRetake={handleRetake} />}
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 size={36} className="animate-spin text-indigo-400" />
              <p className="text-slate-400">Reading receipt with AI...</p>
            </div>
          </div>
        )}

        {stage === 'review' && (
          <div className="space-y-4">
            {imagePreview && <ImagePreview src={imagePreview} onRetake={handleRetake} />}
            {scanError && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-amber-300 text-sm">
                {scanError}
              </div>
            )}
            <ReceiptForm
              parsedReceipt={parsedReceipt}
              expenseType={expenseType}
              imageBase64={imageBase64 ?? undefined}
              imageMimeType={imageMimeType}
              onSaved={handleSaved}
            />
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 inset-x-0 flex justify-center">
          <div className="bg-green-600 text-white px-6 py-3 rounded-full font-medium shadow-lg animate-in fade-in slide-in-from-bottom-2">
            ✓ {toast}
          </div>
        </div>
      )}
    </div>
  );
}
