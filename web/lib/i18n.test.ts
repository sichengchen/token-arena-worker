import { describe, expect, it } from "vitest";

import { getPreferredLocale, stripLocalePrefix } from "./i18n";

describe("getPreferredLocale", () => {
  it("prefers a saved cookie locale before the browser header", () => {
    expect(
      getPreferredLocale({
        cookieLocale: "zh",
        acceptLanguage: "en-US,en;q=0.9",
      }),
    ).toBe("zh");
  });

  it("falls back to the browser locale when there is no cookie", () => {
    expect(
      getPreferredLocale({
        acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.8",
      }),
    ).toBe("zh");
  });

  it("falls back to the default locale when no supported language matches", () => {
    expect(
      getPreferredLocale({
        acceptLanguage: "fr-FR,fr;q=0.9",
      }),
    ).toBe("en");
  });
});

describe("stripLocalePrefix", () => {
  it("removes a supported locale from the pathname", () => {
    expect(stripLocalePrefix("/zh/usage")).toBe("/usage");
    expect(stripLocalePrefix("/en")).toBe("/");
  });

  it("leaves unsupported paths alone", () => {
    expect(stripLocalePrefix("/usage")).toBe("/usage");
    expect(stripLocalePrefix("/fr/usage")).toBe("/fr/usage");
  });
});
