"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "@/components/providers/theme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { persistServerPreference } from "@/lib/preferences-client";
import type { ThemeMode } from "@/lib/theme";

type ThemeSwitcherProps = {
  authenticated?: boolean;
};

export function ThemeSwitcher({ authenticated = false }: ThemeSwitcherProps) {
  const t = useTranslations("common");
  const { themeMode, setThemeMode } = useTheme();

  const handleChange = (nextThemeMode: string) => {
    setThemeMode(nextThemeMode as ThemeMode);

    if (authenticated) {
      void persistServerPreference({ theme: nextThemeMode as ThemeMode }).catch(
        console.error,
      );
    }
  };

  return (
    <Select value={themeMode} onValueChange={handleChange}>
      <SelectTrigger
        aria-label={t("theme")}
        className="h-8 w-[112px] bg-background"
      >
        <SelectValue placeholder={t("theme")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">{t("themes.light")}</SelectItem>
        <SelectItem value="dark">{t("themes.dark")}</SelectItem>
        <SelectItem value="system">{t("themes.system")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
