import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchBar from "@/components/hotel/SearchBar";
import RoomCard from "@/components/hotel/RoomCard";
import { getOffers, getRoomTypes } from "@/lib/beds24/client";
import { isValidIsoDate, nightsBetween } from "@/lib/hotel/dates";
import { hotelConfig } from "@/lib/hotel/config";

type Search = {
  arrival?: string;
  departure?: string;
  adults?: string;
  children?: string;
};

export default async function RoomsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Rooms");
  const tSearch = await getTranslations("Search");

  const hasDates =
    isValidIsoDate(sp.arrival) &&
    isValidIsoDate(sp.departure) &&
    nightsBetween(sp.arrival!, sp.departure!) >= 1;

  const adults = Number(sp.adults ?? "2");
  const childrenNum = Number(sp.children ?? "0");

  let rows: Awaited<ReturnType<typeof loadAvailability>> = [];
  let error: string | null = null;
  if (hasDates) {
    try {
      rows = await loadAvailability({
        arrival: sp.arrival!,
        departure: sp.departure!,
        adults,
        children: childrenNum,
      });
    } catch (e) {
      error = e instanceof Error ? e.message : "Beds24 unavailable";
    }
  }

  const searchParamsObj: Record<string, string> = {
    ...(sp.arrival ? { arrival: sp.arrival } : {}),
    ...(sp.departure ? { departure: sp.departure } : {}),
    adults: String(adults),
    children: String(childrenNum),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
      <div className="mt-6">
        <SearchBar
          initial={{
            arrival: sp.arrival,
            departure: sp.departure,
            adults,
            children: childrenNum,
          }}
        />
      </div>

      {!hasDates ? (
        <p className="mt-8 text-slate-400">{tSearch("selectDates")}</p>
      ) : error ? (
        <div className="mt-8 rounded border border-red-900/50 bg-red-900/20 p-4 text-red-200 text-sm">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <p className="mt-8 text-slate-400">{t("noResults")}</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <RoomCard
              key={r.roomId}
              locale={locale}
              room={r}
              searchParams={searchParamsObj}
            />
          ))}
        </div>
      )}
    </div>
  );
}

async function loadAvailability(params: {
  arrival: string;
  departure: string;
  adults: number;
  children: number;
}) {
  const [rooms, offers] = await Promise.all([
    getRoomTypes(),
    getOffers({
      arrival: params.arrival,
      departure: params.departure,
      numAdults: params.adults,
      numChildren: params.children,
    }),
  ]);
  const nights = nightsBetween(params.arrival, params.departure);

  const cheapestByRoom = new Map<number, (typeof offers)[number]>();
  for (const o of offers) {
    const existing = cheapestByRoom.get(o.roomId);
    if (!existing || o.price < existing.price) cheapestByRoom.set(o.roomId, o);
  }

  return rooms
    .map((r) => {
      const offer = cheapestByRoom.get(r.id);
      if (!offer) return null;
      return {
        roomId: r.id,
        name: r.name,
        description: r.texts?.[0]?.roomDescription ?? r.roomDescription ?? "",
        maxPeople: r.maxPeople ?? r.maxAdult ?? 2,
        images: r.images ?? [],
        price: offer.price,
        currency: offer.currency ?? hotelConfig.currency,
        nights,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));
}
