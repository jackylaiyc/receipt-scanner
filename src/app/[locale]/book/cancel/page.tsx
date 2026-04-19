import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { XCircle } from "lucide-react";

export default async function CancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cancel");

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <XCircle className="mx-auto h-14 w-14 text-slate-500" />
      <h1 className="mt-4 text-3xl font-semibold text-white">{t("title")}</h1>
      <p className="mt-3 text-slate-300">{t("subtitle")}</p>
      <Link
        href="/rooms"
        className="mt-8 inline-flex rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
      >
        {t("tryAgain")}
      </Link>
    </div>
  );
}
