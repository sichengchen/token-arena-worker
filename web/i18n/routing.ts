import { defineRouting } from "next-intl/routing";
import { defaultLocale, localeCookieName, supportedLocales } from "@/lib/i18n";

export const routing = defineRouting({
  locales: [...supportedLocales],
  defaultLocale,
  localePrefix: "always",
  localeCookie: {
    name: localeCookieName,
    maxAge: 60 * 60 * 24 * 365,
  },
});
