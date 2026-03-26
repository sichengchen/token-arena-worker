# Web I18n and Theme Switching Design

Date: 2026-03-26

## Context

The current `web/` app is English-only and has no user-facing theme switcher. Routes live at unscoped paths such as `/login`, `/register`, and `/usage`, most UI copy is hard-coded in components, and there is no persisted preference model for locale or theme.

The user approved these product decisions:

- Use `next-intl` for internationalization
- Support `zh` and `en`
- Use locale-prefixed routes such as `/zh/...` and `/en/...`
- Redirect `/` automatically based on saved preference, then browser language, then fallback
- Support `light`, `dark`, and `system` theme modes
- Persist preferences in the database for signed-in users and locally for signed-out users
- Expose language and theme controls both in the page header and in Settings

## Goals

1. Add complete `zh` / `en` localization for the existing web app pages and shared UI copy.
2. Add a robust three-state theme switcher with correct first paint behavior.
3. Persist locale and theme choices across reloads and across authenticated sessions.
4. Keep navigation locale-aware so switching language preserves the current destination.
5. Extend existing settings infrastructure instead of introducing separate preference silos.

## Non-goals

- Adding more than two languages in this change
- Building a translation management backend
- Redesigning the usage dashboard layout beyond what is needed for the new controls
- Reworking API routes to become locale-aware

## Final UX

### Routing and entry behavior

- All app pages move under `app/[locale]/...`.
- Supported locales are `zh` and `en`.
- Visiting `/` redirects to `/{locale}` using this priority:
  1. signed-in database preference
  2. locale cookie
  3. `Accept-Language`
  4. default fallback
- Legacy non-prefixed app routes such as `/login`, `/register`, `/usage`, `/settings/keys`, and `/usage/setup` redirect to the locale-prefixed equivalent.

### Language switching

- The header shows a compact language switcher beside the existing settings and account controls.
- Auth pages also expose a lightweight language switcher.
- Switching language keeps the user on the same logical page and preserves query params where possible.
- The selected locale updates immediately and is also persisted.

### Theme switching

- The header shows a quick theme switcher with `Light`, `Dark`, and `System`.
- Settings includes the same preference in the Preferences card.
- Theme changes apply immediately without waiting for the save request to finish.
- The first paint should already match the resolved theme to avoid flash.

### Settings

- `Settings > Preferences` expands from two fields to four:
  - Language
  - Theme
  - Timezone
  - Project mode
- Preference autosave behavior remains, but now covers locale and theme too.
- Saving, saved, and error feedback stay lightweight and inline.

## Architecture

### Internationalization

- Use `next-intl` with locale-aware App Router pages.
- Add central routing config for supported locales and default locale behavior.
- Add `messages/en.json` and `messages/zh.json`, grouped by namespace such as:
  - `common`
  - `auth`
  - `usage`
  - `settings`
  - `theme`
- Server components use server-side translation helpers.
- Client components use `useTranslations`.
- Page metadata should be localized and `html lang` should reflect the active locale.

### Theme management

- Add a small theme layer that resolves one of:
  - saved explicit theme (`light` or `dark`)
  - system theme when preference is `system`
- Server-rendered HTML should include the correct theme class or initial script output before hydration.
- The client theme provider/switcher updates DOM state immediately and persists the preference.

### Preference persistence

- Extend `UsagePreference` with:
  - `locale`
  - `theme`
- Signed-in requests treat the database as the source of truth and mirror values into cookies.
- Signed-out requests read and write cookies, with theme optionally mirrored to `localStorage` for resilient client behavior.
- `PATCH /api/usage/preferences` expands to accept and return locale and theme together with timezone and project mode.

### Navigation

- Introduce locale-aware navigation helpers so components do not manually build `/${locale}/...` strings everywhere.
- Auth redirects, logout flows, and usage redirects should all preserve locale.

## Component impact

The following areas require direct updates:

- `web/app/layout.tsx`
- `web/app/page.tsx`
- `web/proxy.ts`
- all current page files migrated from `web/app/*` to `web/app/[locale]/*`
- `web/components/auth/*`
- `web/components/usage/page-shell.tsx`
- `web/components/usage/account-menu.tsx`
- `web/components/usage/settings-dialog.tsx`
- `web/components/usage/settings-preferences.tsx`
- `web/lib/usage/preferences.ts`
- `web/lib/usage/contracts.ts`
- `web/prisma/schema.prisma`

New supporting modules are expected for:

- locale definitions and routing helpers
- message loading
- theme resolution and persistence
- reusable language/theme switcher components

## Error handling

- Unsupported locale paths should redirect to a supported locale rather than strand the user.
- Preference save failures should surface localized inline error feedback.
- Theme changes should feel immediate; if persistence fails, the UI should notify and either retain or revert in a predictable way.
- Missing or malformed local cookies should fall back safely.

## Validation

- `/` redirects to the correct locale for signed-in and signed-out users.
- Locale-prefixed pages render in both `zh` and `en`.
- Header and settings controls can both change locale and theme.
- Locale changes preserve the current destination.
- Theme survives refresh, supports `system`, and avoids incorrect first paint.
- Signed-in preference changes persist to the database and signed-out changes persist locally.
- Existing timezone and project mode behavior continues to work.
