'use client';

import type { ExpenseType } from '@/types/receipt';
import { usePermissions } from '@/context/PermissionsContext';

interface ExpenseTypePickerProps {
  value: ExpenseType;
  onChange: (type: ExpenseType) => void;
}

export default function ExpenseTypePicker({ value, onChange }: ExpenseTypePickerProps) {
  const { canAccessCompany } = usePermissions();

  if (!canAccessCompany) return null;

  return (
    <div className="flex rounded-lg bg-slate-800 p-1 gap-1">
      <button
        onClick={() => onChange('family')}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
          value === 'family' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        🏠 Family
      </button>
      <button
        onClick={() => onChange('company')}
        className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
          value === 'company' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        💼 Company
      </button>
    </div>
  );
}
