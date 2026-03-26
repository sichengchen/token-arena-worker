# Usage Overview Plain Header Design

Date: 2026-03-26

## Context

The current `/usage` page header still reads like a card: it has its own rounded container, background, and border treatment. That extra chrome makes the `Overview` title feel like a boxed widget instead of the page heading, while the filters bar and KPI cards already provide enough visual structure below it.

The user approved the smallest useful simplification:

- remove the outer card treatment from the `Overview` header
- keep the existing content structure
- preserve the inline `Last synced` metadata
- leave the filters bar and data cards unchanged

## Goals

1. Make `Overview` feel like a page header instead of a separate card.
2. Keep the current information hierarchy and actions intact.
3. Reduce visual heaviness without changing behavior or layout logic.

## Non-goals

- Redesign the filters bar
- Move `Last synced` to another row
- Change settings/account interactions
- Alter dashboard data fetching or page routing

## Final UX

### Header

The page header becomes a plain top section:

- no rounded container
- no dedicated background surface
- no outline ring
- title, sync timestamp, and right-side actions stay in the same positions

### Spacing

The header keeps the existing responsive stack behavior, but tightens the vertical rhythm slightly so the now-unboxed section feels intentional rather than like a missing border.

## Implementation strategy

- Update `web/components/usage/page-shell.tsx`
  - remove card-like container classes from the header
  - slightly tighten the vertical gap/padding to match a plain page heading
- Do not change `web/app/usage/page.tsx`
- Add a focused component test that locks in the absence of the old card classes and the presence of the lighter spacing classes

## Validation

- `Overview` renders without the rounded background/ring shell
- `Last synced` still appears inline with the title
- settings and account actions remain aligned on the right
- the filters bar remains the first boxed surface below the header
