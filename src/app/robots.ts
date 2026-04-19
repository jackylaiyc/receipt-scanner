import type { MetadataRoute } from "next";
import { hotelConfig } from "@/lib/hotel/config";

export default function robots(): MetadataRoute.Robots {
  const base = hotelConfig.appUrl.replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/capture",
          "/batch",
          "/dashboard",
          "/receipts",
          "/settings",
          "/login",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
