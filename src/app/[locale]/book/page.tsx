import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import BookingForm from "@/components/hotel/BookingForm";
import { getOffers, getRoomTypes } from "@/lib/beds24/client";
import { isValidIsoDate, nightsBetween } from "@/lib/hotel/dates";
import { formatMoney } from "@/lib/hotel/money";
import { hotelConfig } from "@/lib/hotel/config";

type Search = {
  roomTypeId?: string;
  arrival?: string;
  departure?: string;
  adults?: string;
  children?: string;
};

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Booking");

  const roomId = Number(sp.roomTypeId);
  const adults = Number(sp.adults ?? "2");
  const childrenNum = Number(sp.children ?? "0");
  if (
    !Number.isFinite(roomId) ||
    !isValidIsoDate(sp.arrival) ||
    !isValidIsoDate(sp.departure) ||
    nightsBetween(sp.arrival, sp.departure) < 1
  ) {
    redirect(`/${locale}/rooms`);
  }

  const [rooms, offers] = await Promise.all([
    getRoomTypes(),
    getOffers({
      arrival: sp.arrival,
      departure: sp.departure,
      numAdults: adults,
      numChildren: childrenNum,
      roomId,
    }),
  ]);
  const room = rooms.find((r) => r.id === roomId);
  const offer = offers.find((o) => o.roomId === roomId);
  if (!room || !offer) notFound();

  const nights = nightsBetween(sp.arrival, sp.departure);
  const currency = offer.currency ?? hotelConfig.currency;
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 grid gap-10 md:grid-cols-[1fr,360px]">
      <div>
        <h1 className="text-3xl font-semibold text-white">{t("title")}</h1>
        <div className="mt-6">
          <BookingForm
            roomId={room.id}
            roomName={room.name}
            arrival={sp.arrival}
            departure={sp.departure}
            adults={adults}
            children={childrenNum}
            price={offer.price}
            currency={currency}
            paypalClientId={paypalClientId}
          />
        </div>
      </div>
      <aside className="rounded-lg border border-slate-800 bg-slate-900/60 p-5 h-fit sticky top-6">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">
          {t("summary")}
        </h2>
        <div className="mt-4 space-y-3 text-sm text-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-400">Room</span>
            <span className="font-medium text-white">{room.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Check-in</span>
            <span>{sp.arrival}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Check-out</span>
            <span>{sp.departure}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Nights</span>
            <span>{nights}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Guests</span>
            <span>
              {adults} + {childrenNum}
            </span>
          </div>
          <div className="border-t border-slate-800 pt-3 flex justify-between text-base">
            <span className="font-medium text-white">Total</span>
            <span className="font-semibold text-white">
              {formatMoney(offer.price, currency, locale)}
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
