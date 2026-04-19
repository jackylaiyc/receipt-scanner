const ZERO_DECIMAL: ReadonlySet<string> = new Set([
  "JPY",
  "KRW",
  "VND",
  "CLP",
  "BIF",
  "DJF",
  "GNF",
  "ISK",
  "KMF",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

export function toStripeAmount(amount: number, currency: string): number {
  const upper = currency.toUpperCase();
  if (ZERO_DECIMAL.has(upper)) return Math.round(amount);
  return Math.round(amount * 100);
}

export function fromStripeAmount(amount: number, currency: string): number {
  const upper = currency.toUpperCase();
  if (ZERO_DECIMAL.has(upper)) return amount;
  return amount / 100;
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: ZERO_DECIMAL.has(currency.toUpperCase()) ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency.toUpperCase()} ${amount.toFixed(2)}`;
  }
}
