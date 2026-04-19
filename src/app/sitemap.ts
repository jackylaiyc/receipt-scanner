import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { hotelConfig } from "@/lib/hotel/config";

const STATIC_PATHS = ["", "/rooms"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = hotelConfig.appUrl.replace(/\/$/, "");
  const now = new Date();

  return routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`])
        ),
      },
    }))
  );
}
