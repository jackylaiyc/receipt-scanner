'use client';

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

export interface BatchFile {
  file: File;
  preview: string;
  expenseType: 'family' | 'company';
}

interface BatchUploadZoneProps {
  onFilesSelected: (files: BatchFile[]) => void;
  canAccessCompany: boolean;
}

export default function BatchUploadZone({ onFilesSelected, canAccessCompany }: BatchUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<BatchFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const newFiles: BatchFile[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        expenseType: 'family' as const,
      }));
    const combined = [...selectedFiles, ...newFiles];
    setSelectedFiles(combined);
  }

  function removeFile(index: number) {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
  }

  function updateExpenseType(index: number, type: 'family' | 'company') {
    const updated = [...selectedFiles];
    updated[index] = { ...updated[index], expenseType: type };
    setSelectedFiles(updated);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-indigo-400 bg-indigo-950' : 'border-slate-700 hover:border-slate-500'
        }`}
      >
        <Upload size={32} className="mx-auto text-slate-500 mb-3" />
        <p className="text-slate-300 font-medium">Select multiple receipts</p>
        <p className="text-slate-500 text-sm mt-1">Or drag & drop here</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          {selectedFiles.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-slate-800 rounded-xl p-3">
              <img src={item.preview} alt="" className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.file.name}</p>
                {canAccessCompany && (
                  <div className="flex mt-1 gap-1">
                    {(['family', 'company'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => updateExpenseType(i, t)}
                        className={`text-xs px-2 py-0.5 rounded ${item.expenseType === t ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                      >
                        {t === 'family' ? '🏠' : '💼'} {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                <X size={18} />
              </button>
            </div>
          ))}

          <button
            onClick={() => onFilesSelected(selectedFiles)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Scan {selectedFiles.length} Receipt{selectedFiles.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
