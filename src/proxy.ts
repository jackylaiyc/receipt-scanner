import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/",
    "/(en|ko|ja|zh-TW|zh-CN)/:path*",
    "/((?!_next|api|.*\\..*|capture|batch|receipts|dashboard|settings|login).*)",
  ],
};
