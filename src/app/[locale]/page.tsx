import { getTranslations, setRequestLocale } from "next-intl/server";
import SearchBar from "@/components/hotel/SearchBar";
import { Sparkles, Calendar, Gift } from "lucide-react";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <div>
      <section className="relative border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              {t("heroTitle")}
            </h1>
            <p className="mt-4 text-lg text-slate-300">{t("heroSubtitle")}</p>
          </div>
          <div className="mt-10">
            <SearchBar />
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold text-white">
          {t("benefits.title")}
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Benefit
            icon={<Sparkles className="h-5 w-5" />}
            title={t("benefits.bestRate.title")}
            body={t("benefits.bestRate.body")}
          />
          <Benefit
            icon={<Calendar className="h-5 w-5" />}
            title={t("benefits.flexibility.title")}
            body={t("benefits.flexibility.body")}
          />
          <Benefit
            icon={<Gift className="h-5 w-5" />}
            title={t("benefits.perks.title")}
            body={t("benefits.perks.body")}
          />
        </div>
      </section>
    </div>
  );
}

function Benefit({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{body}</p>
    </div>
  );
}
