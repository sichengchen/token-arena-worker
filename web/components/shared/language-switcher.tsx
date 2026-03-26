"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/lib/i18n";
import {
  persistClientLocale,
  persistServerPreference,
} from "@/lib/preferences-client";

type LanguageSwitcherProps = {
  authenticated?: boolean;
};

export function LanguageSwitcher({
  authenticated = false,
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (nextLocale: string) => {
    if (nextLocale === locale) {
      return;
    }

    persistClientLocale(nextLocale as AppLocale);

    if (authenticated) {
      void persistServerPreference({ locale: nextLocale as AppLocale }).catch(
        console.error,
      );
    }

    const query = Object.fromEntries(searchParams.entries());
    const href = Object.keys(query).length > 0 ? { pathname, query } : pathname;

    router.replace(href, { locale: nextLocale as AppLocale });
  };

  return (
    <Select value={locale} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={t("language")}
        className="h-8 w-[104px] bg-background"
      >
        <SelectValue placeholder={t("language")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t("languages.en")}</SelectItem>
        <SelectItem value="zh">{t("languages.zh")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
