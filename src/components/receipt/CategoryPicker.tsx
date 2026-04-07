'use client';

import { FAMILY_CATEGORIES, COMPANY_CATEGORIES } from '@/constants/categories';
import type { ExpenseType } from '@/types/receipt';

interface CategoryPickerProps {
  value: string;
  onChange: (category: string) => void;
  expenseType: ExpenseType;
}

export default function CategoryPicker({ value, onChange, expenseType }: CategoryPickerProps) {
  const categories = expenseType === 'family' ? FAMILY_CATEGORIES : COMPANY_CATEGORIES;

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-2">Category</label>
      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className={`p-2 rounded-lg text-xs text-center transition-colors ${
              value === cat.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="text-lg mb-1">{cat.icon}</div>
            <div className="leading-tight">{cat.value}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
