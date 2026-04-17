"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ThemeMode } from "@/lib/theme";

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: "light" | "dark";
  setThemeMode: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "tb-theme",
}: {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as ThemeMode | null;
    if (stored) setThemeMode(stored);
  }, [storageKey]);

  useEffect(() => {
    const root = document.documentElement;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = themeMode === "system" ? (systemPrefersDark ? "dark" : "light") : themeMode;

    root.classList.toggle("dark", resolved === "dark");
    root.dataset.themeMode = themeMode;
    setResolvedTheme(resolved);
  }, [themeMode]);

  const handleSetThemeMode = (theme: ThemeMode) => {
    setThemeMode(theme);
    localStorage.setItem(storageKey, theme);
  };

  return (
    <ThemeContext.Provider value={{ themeMode, resolvedTheme, setThemeMode: handleSetThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
