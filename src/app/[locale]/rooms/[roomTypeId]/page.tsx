import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getOffers, getRoomTypes } from "@/lib/beds24/client";
import { isValidIsoDate, nightsBetween } from "@/lib/hotel/dates";
import { formatMoney } from "@/lib/hotel/money";
import { hotelConfig } from "@/lib/hotel/config";
import { ArrowLeft } from "lucide-react";

type Search = {
  arrival?: string;
  departure?: string;
  adults?: string;
  children?: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; roomTypeId: string }>;
}): Promise<Metadata> {
  const { locale, roomTypeId } = await params;
  const roomId = Number(roomTypeId);
  if (!Number.isFinite(roomId)) return {};
  try {
    const rooms = await getRoomTypes();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return {};
    const description =
      room.texts?.[0]?.roomDescription ??
      room.roomDescription ??
      `${room.name} at ${hotelConfig.name}`;
    const image = room.images?.[0]?.url;
    return {
      title: room.name,
      description: description.slice(0, 160),
      alternates: {
        canonical: `/${locale}/rooms/${roomId}`,
      },
      openGraph: {
        title: room.name,
        description: description.slice(0, 160),
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default async function RoomDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; roomTypeId: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale, roomTypeId } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("RoomDetail");

  const roomId = Number(roomTypeId);
  if (!Number.isFinite(roomId)) notFound();

  const rooms = await getRoomTypes();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) notFound();

  const adults = Number(sp.adults ?? "2");
  const childrenNum = Number(sp.children ?? "0");
  const hasDates =
    isValidIsoDate(sp.arrival) &&
    isValidIsoDate(sp.departure) &&
    nightsBetween(sp.arrival!, sp.departure!) >= 1;

  let offer: Awaited<ReturnType<typeof getOffers>>[number] | undefined;
  if (hasDates) {
    const offers = await getOffers({
      arrival: sp.arrival!,
      departure: sp.departure!,
      numAdults: adults,
      numChildren: childrenNum,
      roomId,
    });
    offer = offers.find((o) => o.roomId === roomId);
  }

  const nights = hasDates ? nightsBetween(sp.arrival!, sp.departure!) : 0;
  const description = room.texts?.[0]?.roomDescription ?? room.roomDescription ?? "";
  const bookQuery = new URLSearchParams({
    roomTypeId: String(roomId),
    ...(sp.arrival ? { arrival: sp.arrival } : {}),
    ...(sp.departure ? { departure: sp.departure } : {}),
    adults: String(adults),
    children: String(childrenNum),
  }).toString();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/rooms"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> {t("backToRooms")}
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="rounded-lg overflow-hidden bg-slate-800 aspect-[4/3]">
          {room.images?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={room.images[0].url}
              alt={room.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-slate-600">
              —
            </div>
          )}
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-white">{room.name}</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sleeps {room.maxPeople ?? room.maxAdult ?? 2}
          </p>
          {description && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                {t("description")}
              </h2>
              <p className="mt-2 text-slate-300 whitespace-pre-line">
                {description}
              </p>
            </div>
          )}
          {offer ? (
            <div className="mt-8 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-400">
                  {nights} night(s)
                </span>
                <span className="text-2xl font-semibold text-white">
                  {formatMoney(
                    offer.price,
                    offer.currency ?? hotelConfig.currency,
                    locale
                  )}
                </span>
              </div>
              <Link
                href={`/book?${bookQuery}`}
                className="mt-4 block text-center rounded-md bg-indigo-500 px-4 py-3 text-sm font-medium text-white hover:bg-indigo-400"
              >
                {t("bookNow")}
              </Link>
            </div>
          ) : (
            <div className="mt-8 text-slate-400 text-sm">
              Select dates on the rooms page to see pricing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
