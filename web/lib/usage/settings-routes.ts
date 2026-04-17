export type SettingsSectionId = "account" | "preferences" | "authentication" | "cliKeys";

/** URL segment under `/settings/…` for each settings section. */
export function settingsSectionToPath(section: SettingsSectionId): string {
  switch (section) {
    case "cliKeys":
      return "cli-keys";
    default:
      return section;
  }
}

const PATH_TO_SECTION: Record<string, SettingsSectionId> = {
  account: "account",
  preferences: "preferences",
  authentication: "authentication",
  "cli-keys": "cliKeys",
};

export function parseSettingsSectionParam(segment: string): SettingsSectionId | null {
  return PATH_TO_SECTION[segment] ?? null;
}

/** CLI keys section path (no locale prefix; use with next-intl `Link`). */
export const SETTINGS_CLI_KEYS_HREF = "/settings/cli-keys";

/** Query to open the create-key dialog after landing on CLI keys (see `KeyManager`). */
export const SETTINGS_CLI_KEY_CREATE_QUERY = {
  name: "create" as const,
  value: "1" as const,
} as const;

export function settingsCliKeysHrefWithCreateDialog(): string {
  const { name, value } = SETTINGS_CLI_KEY_CREATE_QUERY;
  return `${SETTINGS_CLI_KEYS_HREF}?${name}=${encodeURIComponent(value)}`;
}
