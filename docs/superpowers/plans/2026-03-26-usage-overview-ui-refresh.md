# Usage Overview UI Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the `/usage` header and filter experience into a compact analysis-first dashboard while merging setup and API key management into a single settings modal.

**Architecture:** Keep the existing server-driven dashboard data flow, but replace the current hero shell with a compact header, replace the full filter card with a toolbar + popovers, and compose a new settings dialog from compact preferences and API key management sections.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, shadcn/ui, Radix-based dialog/popover primitives, Vitest, Biome

---

## Planned File Map

- Modify: `web/app/usage/page.tsx`
- Modify: `web/app/usage/setup/page.tsx`
- Modify: `web/app/settings/keys/page.tsx`
- Modify: `web/components/usage/page-shell.tsx`
- Modify: `web/components/usage/filters-bar.tsx`
- Modify: `web/components/usage/key-manager.tsx`
- Modify: `web/components/usage/setup-card.tsx`
- Create: `web/components/usage/account-menu.tsx`
- Create: `web/components/usage/settings-dialog.tsx`
- Create: `web/components/usage/settings-preferences.tsx`
- Create: `web/components/usage/filter-state.ts`
- Create: `web/components/usage/filter-state.test.ts`

## Task 1: Add failing tests for compact filter-state behavior

**Files:**
- Create: `web/components/usage/filter-state.ts`
- Create: `web/components/usage/filter-state.test.ts`

- [ ] **Step 1: Write failing tests for active chip derivation and reset visibility**

Cover:

- default state (`7d` + empty filters) has no reset
- non-default preset shows reset
- non-empty filters show reset
- active chips only include non-default filters
- chip labels resolve from option tables
- chips collapse to `+N` when more than 3 are active

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm --filter ./web test -- web/components/usage/filter-state.test.ts`

Expected: FAIL because `filter-state.ts` does not exist yet.

- [ ] **Step 3: Implement the minimal helper module to satisfy the tests**

- [ ] **Step 4: Re-run the focused test and verify it passes**

Run: `pnpm --filter ./web test -- web/components/usage/filter-state.test.ts`

Expected: PASS.

## Task 2: Rebuild the usage shell and controls

**Files:**
- Modify: `web/app/usage/page.tsx`
- Modify: `web/components/usage/page-shell.tsx`
- Modify: `web/components/usage/filters-bar.tsx`
- Create: `web/components/usage/account-menu.tsx`

- [ ] **Step 1: Refactor the page shell into a compact overview header**
- [ ] **Step 2: Move `Last synced` inline beside the title**
- [ ] **Step 3: Replace the old filter card with a compact toolbar**
- [ ] **Step 4: Add range + custom date popover behavior**
- [ ] **Step 5: Add secondary filters popover with draft/apply behavior**
- [ ] **Step 6: Render active chips and reset based on the tested helper logic**

## Task 3: Add the unified settings dialog

**Files:**
- Create: `web/components/usage/settings-dialog.tsx`
- Create: `web/components/usage/settings-preferences.tsx`
- Modify: `web/components/usage/key-manager.tsx`
- Modify: `web/components/usage/setup-card.tsx`
- Modify: `web/app/usage/page.tsx`

- [ ] **Step 1: Extract a compact preferences form from the existing setup screen logic**
- [ ] **Step 2: Make the key manager usable inside a dialog without oversized page chrome**
- [ ] **Step 3: Compose both into a stacked settings dialog**
- [ ] **Step 4: Wire the dialog trigger into the new overview header**

## Task 4: Retire the old page-level setup/key navigation

**Files:**
- Modify: `web/app/usage/setup/page.tsx`
- Modify: `web/app/settings/keys/page.tsx`

- [ ] **Step 1: Redirect legacy routes to `/usage`**
- [ ] **Step 2: Verify there are no remaining top-level tabs or stale navigation affordances**

## Task 5: Verify the web app still passes its gates

**Files:**
- Modify: files above as needed

- [ ] **Step 1: Run the focused test suite**

Run: `pnpm --filter ./web test -- web/components/usage/filter-state.test.ts`

- [ ] **Step 2: Run web lint/format checks**

Run: `pnpm lint:web`

- [ ] **Step 3: Run the web build**

Run: `pnpm build:web`

- [ ] **Step 4: Manually smoke-check the usage page**

Run: `pnpm dev:web`

Verify:

- compact header renders
- settings dialog opens
- account menu opens
- filters apply and reset correctly
