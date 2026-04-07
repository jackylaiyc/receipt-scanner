'use client';

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: string;
}

export default function StatCard({ label, value, sub, icon }: StatCardProps) {
  return (
    <div className="bg-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {icon && <span className="text-2xl">{icon}</span>}
      </div>
    </div>
  );
}
