import { useTranslations } from "next-intl";
import { hotelConfig } from "@/lib/hotel/config";

export default function HotelFooter() {
  const t = useTranslations("Footer");
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-900 text-slate-400">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm flex flex-wrap items-center justify-between gap-2">
        <p>
          {t("copyright", {
            year: new Date().getFullYear(),
            hotelName: hotelConfig.name,
          })}
        </p>
        <a
          href={`mailto:${hotelConfig.contactEmail}`}
          className="hover:text-white"
        >
          {hotelConfig.contactEmail}
        </a>
      </div>
    </footer>
  );
}
