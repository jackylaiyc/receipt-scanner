import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ko", "ja", "zh-TW", "zh-CN"] as const,
  defaultLocale: "en",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
};
