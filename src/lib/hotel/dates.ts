export function isValidIsoDate(s: string | null | undefined): s is string {
  if (!s) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export function nightsBetween(arrival: string, departure: string): number {
  const a = new Date(`${arrival}T00:00:00Z`).getTime();
  const d = new Date(`${departure}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((d - a) / (1000 * 60 * 60 * 24)));
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
