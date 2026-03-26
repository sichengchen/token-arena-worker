"use client";

import type { AppLocale } from "@/lib/i18n";
import { localeCookieName } from "@/lib/i18n";
import { type ThemeMode, themeCookieName, themeStorageKey } from "@/lib/theme";
import type { ProjectMode } from "@/lib/usage/types";

const oneYearInSeconds = 60 * 60 * 24 * 365;

type PreferenceUpdate = {
  locale?: AppLocale;
  theme?: ThemeMode;
  timezone?: string;
  projectMode?: ProjectMode;
};

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${oneYearInSeconds}; SameSite=Lax`;
}

export function persistClientLocale(locale: AppLocale) {
  writeCookie(localeCookieName, locale);
}

export function persistClientTheme(theme: ThemeMode) {
  writeCookie(themeCookieName, theme);
  window.localStorage.setItem(themeStorageKey, theme);
}

export async function persistServerPreference(update: PreferenceUpdate) {
  const response = await fetch("/api/usage/preferences", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to save preferences.");
  }

  return payload;
}
