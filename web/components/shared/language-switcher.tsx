"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  authenticated?: boolean;
  variant?: "default" | "compact";
};

export function LanguageSwitcher({
  authenticated = false,
  variant = "default",
}: LanguageSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const compact = variant === "compact";

  const handleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return;
    }

    void persistClientLocale(nextLocale);

    if (authenticated) {
      void persistServerPreference({ locale: nextLocale }).catch(console.error);
    }

    const query = Object.fromEntries(searchParams.entries());
    const href = Object.keys(query).length > 0 ? { pathname, query } : pathname;

    router.replace(href, { locale: nextLocale });
  };

  if (compact) {
    const nextLocale = locale === "en" ? "zh" : "en";

    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`${t("language")}: ${t(`languages.${nextLocale}`)}`}
        title={t(`languages.${nextLocale}`)}
        onClick={() => handleChange(nextLocale)}
      >
        {nextLocale === "en" ? "EN" : "中"}
      </Button>
    );
  }

  return (
    <Select
      value={locale}
      onValueChange={(value) => handleChange(value as AppLocale)}
    >
      <SelectTrigger
        aria-label={t("language")}
        size="default"
        className={cn("h-8 w-[104px] bg-background")}
      >
        <SelectValue placeholder={t("language")} />
      </SelectTrigger>
      <SelectContent align="center">
        <SelectItem value="en">{t("languages.en")}</SelectItem>
        <SelectItem value="zh">{t("languages.zh")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
