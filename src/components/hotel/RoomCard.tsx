import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatMoney } from "@/lib/hotel/money";
import { Users } from "lucide-react";

type Props = {
  locale: string;
  room: {
    roomId: number;
    name: string;
    description?: string;
    maxPeople: number;
    images: Array<{ url: string; description?: string }>;
    price: number;
    currency: string;
    nights: number;
  };
  searchParams: Record<string, string>;
};

export default function RoomCard({ locale, room, searchParams }: Props) {
  const t = useTranslations("Rooms");
  const qs = new URLSearchParams(searchParams).toString();
  const href = `/rooms/${room.roomId}${qs ? `?${qs}` : ""}`;

  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900/60 overflow-hidden flex flex-col">
      <div className="aspect-[4/3] bg-slate-800 overflow-hidden">
        {room.images[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.images[0].url}
            alt={room.images[0].description ?? room.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-slate-600 text-sm">
            —
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{room.name}</h3>
          <p className="mt-1 text-sm text-slate-400 inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {t("sleeps", { count: room.maxPeople })}
          </p>
        </div>
        {room.description && (
          <p className="text-sm text-slate-300 line-clamp-3">
            {room.description}
          </p>
        )}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-400">{t("from")}</p>
            <p className="text-lg font-semibold text-white">
              {formatMoney(room.price, room.currency, locale)}
            </p>
            <p className="text-xs text-slate-500">
              · {room.nights} night(s) total
            </p>
          </div>
          <Link
            href={href}
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            {t("viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
