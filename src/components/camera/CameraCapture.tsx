'use client';

import { useRef, useState } from 'react';
import { Camera, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (file: File) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
    // Reset so same file can be selected again
    e.target.value = '';
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) onCapture(file);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Hidden file input - capture="environment" for iOS rear camera */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Take receipt photo"
      />

      {/* Primary camera button */}
      <button
        onClick={() => inputRef.current?.click()}
        className="w-40 h-40 rounded-full bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all flex flex-col items-center justify-center gap-3 shadow-2xl shadow-indigo-900"
        aria-label="Open camera"
      >
        <Camera size={52} className="text-white" />
        <span className="text-white font-semibold text-sm">Scan Receipt</span>
      </button>

      {/* Alternative: pick from gallery (no capture attr) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-indigo-400 bg-indigo-950' : 'border-slate-700 hover:border-slate-500'
        }`}
        onClick={() => {
          // Open gallery picker (no capture attr)
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onCapture(file);
          };
          input.click();
        }}
      >
        <Upload size={24} className="mx-auto text-slate-500 mb-2" />
        <p className="text-slate-400 text-sm">Or pick from gallery / drag & drop</p>
      </div>
    </div>
  );
}
