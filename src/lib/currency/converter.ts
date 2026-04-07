interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
}

const cache = new Map<string, RateCache>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function convertToUSD(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency.toUpperCase() === 'USD') return amount;

  const key = fromCurrency.toUpperCase();
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    const rate = cached.rates['USD'];
    return rate ? amount * rate : amount;
  }

  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=${key}&to=USD`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return amount;
    const data = await res.json() as { rates: Record<string, number> };
    cache.set(key, { rates: data.rates, timestamp: now });
    const rate = data.rates['USD'];
    return rate ? amount * rate : amount;
  } catch {
    return amount;
  }
}
