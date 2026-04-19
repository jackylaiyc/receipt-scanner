import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { getStripe } from "@/lib/stripe/client";

type Search = { session_id?: string; ref?: string; provider?: string };

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Search>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("Confirmation");

  let reference: string | null = sp.ref ?? null;
  if (!reference && sp.session_id) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(
        sp.session_id
      );
      reference =
        (session.payment_intent as string | null) ?? session.id ?? null;
    } catch {
      reference = sp.session_id;
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
      <h1 className="mt-4 text-3xl font-semibold text-white">{t("title")}</h1>
      <p className="mt-3 text-slate-300">{t("subtitle")}</p>
      {reference && (
        <p className="mt-6 text-sm text-slate-400">
          {t("reference")}:{" "}
          <span className="font-mono text-slate-200">{reference}</span>
        </p>
      )}
      <p className="mt-4 text-sm text-slate-400">{t("email")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-400"
      >
        {t("backHome")}
      </Link>
    </div>
  );
}
