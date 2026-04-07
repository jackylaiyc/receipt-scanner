'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import { signOut, useSession } from 'next-auth/react';
import { usePermissions } from '@/context/PermissionsContext';
import { Download, LogOut } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'HKD', 'SGD', 'CNY'];

export default function SettingsPage() {
  const { data: session } = useSession();
  const { canAccessCompany } = usePermissions();
  const [exportType, setExportType] = useState<'family' | 'company'>('family');
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));

  function handleExport() {
    const params = new URLSearchParams({ type: exportType, month: exportMonth, format: 'csv' });
    window.open(`/api/sheets/export?${params}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Header title="Settings" />
      <div className="px-4 py-6 max-w-lg mx-auto space-y-6">

        {/* Profile */}
        <div className="bg-slate-800 rounded-xl p-4 flex items-center gap-3">
          {session?.user?.image && (
            <img src={session.user.image} alt="" className="w-10 h-10 rounded-full" />
          )}
          <div>
            <p className="text-white font-medium">{session?.user?.name}</p>
            <p className="text-slate-400 text-sm">{session?.user?.email}</p>
            {canAccessCompany && <span className="text-xs text-indigo-400 mt-0.5 block">Admin — Company access enabled</span>}
          </div>
        </div>

        {/* Export */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-3">
          <h2 className="text-sm font-medium text-slate-300">Export Receipts</h2>
          {canAccessCompany && (
            <div className="flex rounded-lg bg-slate-700 p-1 gap-1">
              {(['family', 'company'] as const).map((t) => (
                <button key={t} onClick={() => setExportType(t)}
                  className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${exportType === t ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                  {t === 'family' ? '🏠 Family' : '💼 Company'}
                </button>
              ))}
            </div>
          )}
          <div>
            <label className="text-xs text-slate-400 block mb-1">Month</label>
            <input type="month" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <button onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
            <Download size={16} /> Download CSV
          </button>
        </div>

        {/* Google Sheets IDs (read-only info) */}
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-sm font-medium text-slate-300">Spreadsheets</h2>
          <p className="text-xs text-slate-500">Connected to Google Sheets via service account. To update spreadsheet IDs, change the environment variables on your server.</p>
        </div>

        {/* Sign out */}
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center justify-center gap-2 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 py-3 rounded-xl text-sm transition-colors">
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
