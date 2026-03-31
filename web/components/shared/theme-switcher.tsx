"use client";

import { Check, Monitor, MoonStar, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { persistServerPreference } from "@/lib/preferences-client";
import { type ThemeMode, themeModes } from "@/lib/theme";
import { cn, FOOTER_ICON_BUTTON_CLASS } from "@/lib/utils";

const themeIcons = {
  light: Sun,
  dark: MoonStar,
  system: Monitor,
} as const;

type ThemeSwitcherProps = {
  authenticated?: boolean;
  variant?: "default" | "compact" | "icon";
  /** Circular neutral icon button for dark footer. */
  footerIcon?: boolean;
};

export function ThemeSwitcher({
  authenticated = false,
  variant = "default",
  footerIcon = false,
}: ThemeSwitcherProps) {
  const t = useTranslations("common");
  const { resolvedTheme, themeMode, setThemeMode } = useTheme();
  const compact = variant === "compact";
  const nextThemeMode = resolvedTheme === "dark" ? "light" : "dark";
  const CompactThemeIcon = nextThemeMode === "dark" ? MoonStar : Sun;
  const [open, setOpen] = useState(false);
  const TriggerIcon = themeIcons[themeMode];

  const handleChange = (nextThemeMode: ThemeMode) => {
    if (nextThemeMode === themeMode) {
      setOpen(false);
      return;
    }

    setThemeMode(nextThemeMode);

    if (authenticated) {
      void persistServerPreference({ theme: nextThemeMode }).catch(
        console.error,
      );
    }

    setOpen(false);
  };

  if (variant === "icon") {
    const iconButtonClass = footerIcon
      ? FOOTER_ICON_BUTTON_CLASS
      : "rounded-full hover:bg-muted/70 dark:hover:bg-muted/45";

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={footerIcon ? "icon" : "icon-sm"}
            className={iconButtonClass}
            aria-label={t("theme")}
            aria-expanded={open}
          >
            <TriggerIcon className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="top"
          sideOffset={8}
          className="w-auto min-w-[10rem] p-1"
        >
          <div className="flex flex-col gap-0.5" role="listbox">
            {themeModes.map((mode) => {
              const Icon = themeIcons[mode];
              return (
                <button
                  key={mode}
                  type="button"
                  role="option"
                  aria-selected={themeMode === mode}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                    themeMode === mode && "bg-accent/60",
                  )}
                  onClick={() => handleChange(mode)}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 shrink-0 opacity-80" />
                    {t(`themes.${mode}`)}
                  </span>
                  {themeMode === mode ? (
                    <Check className="size-4 shrink-0 opacity-80" />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`${t("theme")}: ${t(`themes.${nextThemeMode}`)}`}
        title={t(`themes.${nextThemeMode}`)}
        onClick={() => handleChange(nextThemeMode)}
      >
        <CompactThemeIcon className="size-3.5" />
      </Button>
    );
  }

  return (
    <Select
      value={themeMode}
      onValueChange={(value) => handleChange(value as ThemeMode)}
    >
      <SelectTrigger
        aria-label={t("theme")}
        size="default"
        className={cn("h-8 w-[112px] bg-background")}
      >
        <SelectValue placeholder={t("theme")} />
      </SelectTrigger>
      <SelectContent align="center">
        <SelectItem value="light">{t("themes.light")}</SelectItem>
        <SelectItem value="dark">{t("themes.dark")}</SelectItem>
        <SelectItem value="system">{t("themes.system")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
