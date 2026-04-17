import { describe, expect, it } from "vitest";

import { defaultThemeMode, getThemeMode, resolveThemeAppearance, themeCookieName } from "./theme";

describe("theme helpers", () => {
  it("normalizes supported theme values", () => {
    expect(getThemeMode("light")).toBe("light");
    expect(getThemeMode("dark")).toBe("dark");
    expect(getThemeMode("system")).toBe("system");
    expect(getThemeMode("unexpected")).toBe(defaultThemeMode);
  });

  it("resolves system mode from the current preference", () => {
    expect(resolveThemeAppearance("dark", false)).toBe("dark");
    expect(resolveThemeAppearance("light", true)).toBe("light");
    expect(resolveThemeAppearance("system", true)).toBe("dark");
    expect(resolveThemeAppearance("system", false)).toBe("light");
  });

  it("uses a stable cookie name", () => {
    expect(themeCookieName).toBe("tb-theme");
  });
});
