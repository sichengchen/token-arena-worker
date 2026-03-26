# Settings Dialog Refresh Design

Date: 2026-03-26

## Context

The current usage settings dialog feels visually noisy: too many explanatory sentences, oversized section chrome, weak spacing hierarchy, and bulky action buttons in the API key table.

The user approved a compact refresh with these product decisions:

- Remove most descriptive copy from the modal body
- Keep only essential labels and section titles
- Make the preferences area feel like a compact control panel instead of a form with helper paragraphs
- Convert API key row actions to icon-only buttons
- Tighten the key table and section spacing so the dialog reads as one coherent surface
- Reduce vertical spacing around section headers, form rows, and key rows

## Goals

1. Make the settings dialog feel cleaner and more intentional.
2. Reduce visual clutter without removing functionality.
3. Improve alignment, spacing, and button consistency.
4. Keep destructive and state-changing actions discoverable via accessible icon buttons.

## Non-goals

- Changing API contracts or settings behavior
- Redesigning the create/rename key dialogs
- Adding new settings fields or workflows

## Final UX

### Modal shell

- Keep the top-level `Settings` title.
- Keep one short modal description in the header only.
- Use a softer surface treatment with tighter spacing in the body.

### Preferences section

- Remove the verbose section description.
- Present timezone and project mode in a compact two-column grid.
- Remove the explicit save button.
- Autosave preference changes after a short debounce.
- Show lightweight inline feedback such as `Saving...` and `Saved`.
- Keep the title-to-fields spacing and label-to-input spacing compact.

### API keys section

- Remove the long section description.
- Keep lightweight summary badges and a single create button in the header.
- Use a tighter table with a quieter header and stronger row alignment.
- Render actions as icon-only buttons with screen-reader labels and tooltips via `title`.
- Keep the header, badges, and table rows vertically compact.

### Feedback states

- Keep success/error alerts, but within the tighter layout.
- Preserve the one-time raw key disclosure block, but style it as a compact utility callout.

## Validation

- The modal body should no longer show the removed explanatory paragraphs.
- API key row actions should show icons only, with accessible labels.
- Preference changes should save automatically and show lightweight status feedback.
- Existing key creation, rename, disable/enable, delete, and preference saving flows must keep working.
