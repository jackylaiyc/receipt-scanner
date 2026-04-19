"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { addDaysIso, todayIso } from "@/lib/hotel/dates";

type Props = {
  initial?: {
    arrival?: string;
    departure?: string;
    adults?: number;
    children?: number;
  };
};

export default function SearchBar({ initial }: Props) {
  const t = useTranslations("Search");
  const router = useRouter();
  const [arrival, setArrival] = useState(initial?.arrival ?? todayIso());
  const [departure, setDeparture] = useState(
    initial?.departure ?? addDaysIso(todayIso(), 2)
  );
  const [adults, setAdults] = useState(initial?.adults ?? 2);
  const [children, setChildren] = useState(initial?.children ?? 0);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      arrival,
      departure,
      adults: String(adults),
      children: String(children),
    });
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-900/70 border border-slate-800 rounded-lg p-4"
    >
      <label className="flex flex-col text-sm">
        <span className="text-slate-400">{t("checkIn")}</span>
        <input
          type="date"
          value={arrival}
          min={todayIso()}
          onChange={(e) => setArrival(e.target.value)}
          className="mt-1 rounded bg-slate-800 border border-slate-700 px-2 py-2 text-slate-100"
          required
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="text-slate-400">{t("checkOut")}</span>
        <input
          type="date"
          value={departure}
          min={addDaysIso(arrival, 1)}
          onChange={(e) => setDeparture(e.target.value)}
          className="mt-1 rounded bg-slate-800 border border-slate-700 px-2 py-2 text-slate-100"
          required
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="text-slate-400">{t("adults")}</span>
        <input
          type="number"
          min={1}
          max={10}
          value={adults}
          onChange={(e) => setAdults(Number(e.target.value))}
          className="mt-1 rounded bg-slate-800 border border-slate-700 px-2 py-2 text-slate-100"
        />
      </label>
      <label className="flex flex-col text-sm">
        <span className="text-slate-400">{t("children")}</span>
        <input
          type="number"
          min={0}
          max={10}
          value={children}
          onChange={(e) => setChildren(Number(e.target.value))}
          className="mt-1 rounded bg-slate-800 border border-slate-700 px-2 py-2 text-slate-100"
        />
      </label>
      <button
        type="submit"
        className="md:self-end rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
      >
        {t("search")}
      </button>
    </form>
  );
}
