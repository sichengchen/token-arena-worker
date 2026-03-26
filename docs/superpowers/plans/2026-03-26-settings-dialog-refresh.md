# Settings Dialog Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the `/usage` settings dialog so it looks cleaner, uses less copy, and presents API key actions as icon-only controls.

**Architecture:** Keep the existing dialog and API flows, but centralize compact view metadata in a small helper module, then restyle the settings dialog, preferences section, and key manager around that shared metadata. Preference edits should save automatically after a short debounce and expose inline status instead of a primary action button.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, shadcn/ui, Tailwind CSS, Vitest, Biome

---

## Planned File Map

- Create: `web/lib/usage/settings-view.ts`
- Create: `web/lib/usage/settings-view.test.ts`
- Modify: `web/components/usage/settings-dialog.tsx`
- Modify: `web/components/usage/settings-preferences.tsx`
- Modify: `web/components/usage/key-manager.tsx`

## Task 1: Add failing tests for shared settings view helpers

**Files:**
- Create: `web/lib/usage/settings-view.test.ts`
- Create: `web/lib/usage/settings-view.ts`

- [ ] **Step 1: Write failing tests for preference dirty-state, autosave status text, and key summary helpers**
- [ ] **Step 2: Run the focused test and verify it fails because the module does not exist yet**
- [ ] **Step 3: Implement the minimal helper module**
- [ ] **Step 4: Re-run the focused test and verify it passes**

## Task 2: Refresh the dialog shell and preferences layout

**Files:**
- Modify: `web/components/usage/settings-dialog.tsx`
- Modify: `web/components/usage/settings-preferences.tsx`
- Modify: `web/lib/usage/settings-view.ts`

- [ ] **Step 1: Tighten dialog spacing and soften the modal body surface**
- [ ] **Step 2: Remove verbose preferences copy and add clearer compact hierarchy**
- [ ] **Step 3: Replace the explicit save button with debounced autosave and inline status feedback**
- [ ] **Step 4: Reduce vertical spacing in section headers, fields, and key rows**

## Task 3: Refresh API key management presentation

**Files:**
- Modify: `web/components/usage/key-manager.tsx`
- Modify: `web/lib/usage/settings-view.ts`

- [ ] **Step 1: Replace memoized inline summary logic with the shared helper**
- [ ] **Step 2: Tighten table spacing and status/prefix presentation**
- [ ] **Step 3: Convert row actions to icon-only buttons with accessible labels**
- [ ] **Step 4: Compact the one-time raw key disclosure block**
- [ ] **Step 5: Reduce vertical spacing between the API key header and table rows**

## Task 4: Verify the changes

**Files:**
- Modify: files above as needed

- [ ] **Step 1: Run the focused helper test**

Run: `pnpm --filter ./web exec vitest run lib/usage/settings-view.test.ts`

- [ ] **Step 2: Run web lint**

Run: `pnpm lint:web`

- [ ] **Step 3: Run the web build**

Run: `pnpm build:web`
