'use client';

import { RotateCcw } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  onRetake: () => void;
}

export default function ImagePreview({ src, onRetake }: ImagePreviewProps) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-slate-800">
      <img src={src} alt="Receipt preview" className="w-full max-h-80 object-contain" />
      <button
        onClick={onRetake}
        className="absolute top-3 right-3 p-2 bg-slate-900/80 rounded-full text-slate-300 hover:text-white"
        aria-label="Retake photo"
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
}
