import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { hotelConfig } from "@/lib/hotel/config";
import HotelHeader from "@/components/hotel/HotelHeader";
import HotelFooter from "@/components/hotel/HotelFooter";
import LocaleHtmlLang from "@/components/hotel/LocaleHtmlLang";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: hotelConfig.name,
      template: `%s · ${hotelConfig.name}`,
    },
    description: "Book direct. Best rate guaranteed.",
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`])
      ),
    },
  };
}

export default async function HotelLocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleHtmlLang locale={locale} />
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <HotelHeader />
        <main className="flex-1">{children}</main>
        <HotelFooter />
      </div>
    </NextIntlClientProvider>
  );
}
