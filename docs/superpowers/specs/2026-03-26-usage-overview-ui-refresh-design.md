# Usage Overview UI Refresh Design

Date: 2026-03-26

## Context

The current `/usage` overview header and filters area is too verbose for the core dashboard job. It spends too much space on page identity, account copy, and tabbed navigation, while the primary user intent is to inspect data quickly.

The user approved a tighter “analysis-first” redesign with these product decisions:

- Keep `Overview` as the only main page
- Remove `Setup` and `API Keys` from page-level tabs
- Merge setup/preferences and API key management into a single `Settings` modal
- Move account identity into a lightweight avatar menu
- Keep only the time range controls always visible
- Move secondary filters into a popover panel
- Place `Last synced` inline beside `Overview`

## Goals

1. Make the `/usage` top area feel compact and focused.
2. Preserve all existing filtering power without always showing every control.
3. Reduce navigation noise by collapsing configuration into a modal.
4. Keep the first screen centered on data exploration.

## Non-goals

- Redesign KPI cards, charts, or breakdown tables
- Change dashboard data semantics or query contracts
- Add new account management features beyond the existing sign-out flow

## Final UX

### Header

The page header becomes a compact workspace header instead of a hero card.

- Left side:
  - `Overview`
  - weak inline meta: `Last synced ...`
- Right side:
  - `Settings` button
  - avatar trigger

Removed from the header:

- `Usage Dashboard` badge
- timezone badge
- long descriptive copy
- signed-in email text
- `Overview / Setup / API Keys` tabs

### Controls row

The filters section becomes a compact control bar:

- always visible range pills: `1D`, `7D`, `30D`, `Custom`
- `Filters` button that opens a popover
- active filter chips shown only for non-default filters
- `Reset` shown only when the current view is not the default state

Default state:

- preset = `7d`
- no secondary filters selected

### Custom range interaction

`Custom` opens a small date popover with:

- `From`
- `To`
- `Apply`

### Filters interaction

The filters popover contains:

- API key
- device
- tool
- model
- project

Interaction style:

- edit inside the panel
- apply once via `Apply`
- clear via `Reset all`

### Active chips

Show only non-default filters.

- up to 3 chips rendered inline
- extra filters collapse into `+N`
- each visible chip can be removed directly

### Settings modal

The settings modal becomes the single configuration surface for this area.

Sections:

1. Preferences
   - timezone
   - project mode
2. API Keys
   - list keys
   - create / rename / disable / delete

The modal uses stacked sections, not tabs.

### Account menu

The avatar menu shows:

- user email
- sign out

`Settings` stays outside the avatar menu as a first-class page action.

## Implementation strategy

### Page shell

Refactor the usage page shell into a compact header that accepts:

- title
- last synced label
- email
- settings content
- page body

### Filters

Rebuild the current `FiltersBar` as:

- compact toolbar
- internal draft state for secondary filters
- popover-based secondary filters
- helper logic for active chips and reset visibility

### Settings

Create a new `settings-dialog` component that composes:

- a compact preferences editor
- a compact API key manager

Reuse existing API endpoints and key-management flows.

### Legacy routes

Keep `/usage/setup` and `/settings/keys` safe by redirecting them to `/usage` instead of leaving stale page-level navigation around.

## Validation

- `/usage` should render a tighter first screen with no large hero block.
- `Last synced` should appear inline next to `Overview`.
- Time range changes should keep existing query behavior.
- Secondary filters should only apply after the user confirms.
- Settings modal should allow preference edits and API key management without leaving `/usage`.
