'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, Grid2x2, LayoutDashboard, List, Settings } from 'lucide-react';
import { usePermissions } from '@/context/PermissionsContext';

const navItems = [
  { href: '/capture', label: 'Scan', icon: Camera, company: false },
  { href: '/batch', label: 'Batch', icon: Grid2x2, company: false },
  { href: '/dashboard/family', label: 'Dashboard', icon: LayoutDashboard, company: false },
  { href: '/receipts', label: 'History', icon: List, company: false },
  { href: '/settings', label: 'Settings', icon: Settings, company: false },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { canAccessCompany } = usePermissions();

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-area-bottom z-10">
      <div className="flex items-stretch h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {canAccessCompany && (
          <Link
            href="/dashboard/company"
            className={`flex-1 flex flex-col items-center justify-center gap-1 text-xs transition-colors ${
              pathname.startsWith('/dashboard/company') ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LayoutDashboard size={20} />
            <span>Company</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
