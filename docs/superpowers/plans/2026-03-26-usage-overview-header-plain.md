# Usage Overview Plain Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the boxed card treatment from the `/usage` overview header while keeping the existing content and actions intact.

**Architecture:** Keep the current server-rendered usage page structure, but simplify the page shell header styling so it behaves like a plain page heading. Lock in the visual contract with a focused component test that asserts the lighter class set.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, Vitest, Biome

---

## Planned File Map

- Modify: `web/components/usage/page-shell.tsx`
- Create: `web/components/usage/page-shell.test.tsx`

## Task 1: Add a failing test for the plain overview header

**Files:**
- Create: `web/components/usage/page-shell.test.tsx`

- [ ] **Step 1: Write the failing test**

Assert that `UsagePageShell`:

- still renders the title and `Last synced` copy
- no longer renders the old `rounded-2xl bg-background ... ring-1` card classes
- uses the lighter header spacing classes

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm --filter ./web test -- web/components/usage/page-shell.test.tsx`

Expected: FAIL because the current component still renders the boxed header classes.

- [ ] **Step 3: Implement the minimal style change in `page-shell.tsx`**

- [ ] **Step 4: Re-run the focused test and verify it passes**

Run: `pnpm --filter ./web test -- web/components/usage/page-shell.test.tsx`

Expected: PASS.

## Task 2: Verify the web workspace gates

**Files:**
- Modify: files above as needed

- [ ] **Step 1: Run the focused component test**

Run: `pnpm --filter ./web test -- web/components/usage/page-shell.test.tsx`

- [ ] **Step 2: Run web lint checks**

Run: `pnpm lint:web`

- [ ] **Step 3: Run the web build**

Run: `pnpm --filter ./web build`

- [ ] **Step 4: Manually inspect the `/usage` page if desired**

Run: `pnpm dev:web`

Verify:

- the top header is plain, not boxed
- the filters bar remains the first surfaced container below it
