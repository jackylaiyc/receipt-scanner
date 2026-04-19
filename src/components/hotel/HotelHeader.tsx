import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { hotelConfig } from "@/lib/hotel/config";
import LanguageSwitcher from "./LanguageSwitcher";

export default function HotelHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-lg font-semibold text-white tracking-wide"
        >
          {hotelConfig.name}
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link href="/rooms" className="hover:text-white">
            {t("rooms")}
          </Link>
          <Link href="/#about" className="hover:text-white">
            {t("about")}
          </Link>
          <Link href="/#contact" className="hover:text-white">
            {t("contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/rooms"
            className="hidden sm:inline-flex rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-400"
          >
            {t("book")}
          </Link>
        </div>
      </div>
    </header>
  );
}
