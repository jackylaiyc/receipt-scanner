"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeLabels, type Locale } from "@/i18n/routing";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Locale;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-300">
      <Globe className="h-4 w-4" aria-hidden />
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        aria-label="Language"
        className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {Object.entries(localeLabels).map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
