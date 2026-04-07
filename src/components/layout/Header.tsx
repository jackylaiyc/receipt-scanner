'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function Header({ title, showBack = false, rightElement }: HeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center gap-3 safe-area-top">
      {showBack && (
        <button onClick={() => router.back()} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <ChevronLeft size={22} />
        </button>
      )}
      <h1 className="flex-1 text-lg font-semibold text-white">{title}</h1>
      {rightElement}
    </header>
  );
}
