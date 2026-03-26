import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { KeyManager } from "./key-manager";
import { SettingsPreferences } from "./settings-preferences";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) =>
    ({
      preferencesTitle: "Preferences",
      saving: "Saving...",
      saved: "Saved",
      language: "Language",
      theme: "Theme",
      timezone: "Timezone",
      projectMode: "Project mode",
      selectTimezone: "Select timezone",
      selectProjectMode: "Select project mode",
      "projectModes.hashed": "Hashed",
      "projectModes.raw": "Raw",
      "projectModes.disabled": "Disabled",
      pageTitle: "CLI API Keys",
      dialogTitle: "API Keys",
      total: "1 total",
      active: "1 active",
      createKey: "Create key",
      requestFailed: "Request failed.",
      copyFailed: "Copy failed.",
      newKey: "New key",
      copyShownOnce: "Copy it now.",
      copyKey: "Copy key",
      "table.name": "Name",
      "table.prefix": "Prefix",
      "table.status": "Status",
      "table.lastUsed": "Last Used",
      "table.created": "Created",
      "table.actions": "Actions",
      "table.never": "Never",
      "status.active": "active",
      "status.disabled": "disabled",
      "actions.rename": "Rename key",
      "actions.disable": "Disable key",
      "actions.enable": "Enable key",
      "actions.delete": "Delete key",
      "dialog.createTitle": "Create CLI key",
      "dialog.renameTitle": "Rename CLI key",
      "dialog.createDescription": "Description",
      "dialog.renameDescription": "Description",
      "dialog.name": "Name",
      "dialog.placeholder": "My MacBook / Work",
      "dialog.saving": "Saving...",
      "dialog.createKey": "Create key",
      "dialog.saveChanges": "Save changes",
    })[key] ?? key,
}));

vi.mock("@/components/shared/language-switcher", () => ({
  LanguageSwitcher: () => <div data-slot="language-switcher" />,
}));

vi.mock("@/components/shared/theme-switcher", () => ({
  ThemeSwitcher: () => <div data-slot="theme-switcher" />,
}));

describe("settings dialog section spacing", () => {
  it("renders the preferences section with tighter header and field spacing", () => {
    const markup = renderToStaticMarkup(
      <SettingsPreferences
        initialLocale="en"
        initialTheme="system"
        initialTimezone="Asia/Shanghai"
        initialProjectMode="raw"
      />,
    );

    expect(markup).toContain("border-b border-border/50 pb-2");
    expect(markup).toContain("space-y-3 pt-3");
    expect(markup).toContain("grid gap-3 lg:grid-cols-2");
    expect(markup).toContain("space-y-1.5");
    expect(markup).not.toContain("space-y-4 pt-4");
  });

  it("renders the api keys section with tighter header and content spacing", () => {
    const markup = renderToStaticMarkup(
      <KeyManager
        initialKeys={[
          {
            id: "key_123",
            name: "test",
            prefix: "vbu_5de06989",
            status: "active",
            lastUsedAt: "2026-03-26T09:05:35.000Z",
            createdAt: "2026-03-26T08:44:25.000Z",
          },
        ]}
        variant="dialog"
      />,
    );

    expect(markup).toContain("gap-2 border-b border-border/50 pb-2");
    expect(markup).toContain("space-y-3 pt-3");
    expect(markup).not.toContain("space-y-4 pt-4");
  });
});
