# Usage Dashboard and Unified Ingest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship email/password auth, usage API key management, unified CLI upload semantics, and a first-pass `/usage` dashboard that matches the approved spec.

**Architecture:** Keep browser auth and CLI auth separate. Web users authenticate with better-auth sessions; CLI instances authenticate with app-owned `vbu_` API keys tied to the signed-in user. Normalize token/session semantics in the CLI before upload, persist canonical bucket/session records in Postgres, and render the dashboard from server-side aggregation helpers shared by both route handlers and pages.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Prisma + PostgreSQL, better-auth, shadcn/ui, Recharts, Zod, Commander CLI, Vitest, Biome

---

## Planned File Map

### Web auth and route protection

- Modify: `web/lib/auth.ts` — enable email/password auth and export the canonical Better Auth instance.
- Create: `web/lib/auth-client.ts` — browser auth client for sign-in/sign-up/sign-out calls.
- Create: `web/lib/session.ts` — server helpers such as `getSessionOrRedirect()` / `getOptionalSession()`.
- Create: `web/app/api/auth/[...all]/route.ts` — mount Better Auth route handlers.
- Create: `web/proxy.ts` — optimistic redirects for protected app routes.
- Modify: `web/app/page.tsx` — redirect users to `/usage` or `/login`.

### Web usage domain and persistence

- Modify: `web/prisma/schema.prisma` — add `UsagePreference`, `UsageApiKey`, `Device`, `UsageBucket`, `UsageSession`, and related enums/relations.
- Modify: `web/prisma.config.ts` — fix current Biome lint issue while touching Prisma config.
- Create: `web/lib/usage/types.ts` — shared dashboard/ingest TypeScript types.
- Create: `web/lib/usage/contracts.ts` — Zod schemas for ingest payloads and query params.
- Create: `web/lib/usage/preferences.ts` — load/create/update per-user timezone + project mode settings.
- Create: `web/lib/usage/api-keys.ts` — generate/hash/verify usage API keys and CRUD helpers.
- Create: `web/lib/usage/project.ts` — project mode helpers (`hashed | raw | disabled`) and display-label helpers.
- Create: `web/lib/usage/date-range.ts` — parse dashboard ranges and previous-period comparisons.
- Create: `web/lib/usage/queries.ts` — aggregate overview, trend, and breakdown data from Prisma.
- Create: `web/lib/usage/ingest.ts` — upsert device/bucket/session rows and update API key last-used timestamps.

### Web routes and pages

- Create: `web/app/login/page.tsx`
- Create: `web/app/register/page.tsx`
- Create: `web/app/usage/page.tsx`
- Create: `web/app/usage/setup/page.tsx`
- Create: `web/app/settings/keys/page.tsx`
- Create: `web/app/api/usage/settings/route.ts`
- Create: `web/app/api/usage/ingest/route.ts`
- Create: `web/app/api/usage/dashboard/route.ts`
- Create: `web/app/api/usage/filters/route.ts`
- Create: `web/app/api/usage/keys/route.ts`
- Create: `web/app/api/usage/keys/[id]/route.ts`
- Create: `web/app/api/usage/preferences/route.ts`

### Web components

- Generate via shadcn: `web/components/ui/alert.tsx`, `badge.tsx`, `calendar.tsx`, `card.tsx`, `dialog.tsx`, `input.tsx`, `label.tsx`, `popover.tsx`, `select.tsx`, `skeleton.tsx`, `table.tsx`, `tabs.tsx`
- Create: `web/components/auth/auth-shell.tsx`
- Create: `web/components/auth/login-form.tsx`
- Create: `web/components/auth/register-form.tsx`
- Create: `web/components/auth/logout-button.tsx`
- Create: `web/components/usage/filters-bar.tsx`
- Create: `web/components/usage/kpi-grid.tsx`
- Create: `web/components/usage/token-trend-card.tsx`
- Create: `web/components/usage/activity-trend-card.tsx`
- Create: `web/components/usage/breakdown-tabs.tsx`
- Create: `web/components/usage/breakdown-table.tsx`
- Create: `web/components/usage/empty-state.tsx`
- Create: `web/components/usage/setup-card.tsx`
- Create: `web/components/usage/key-manager.tsx`
- Create: `web/components/usage/key-dialog.tsx`

### CLI normalization and upload

- Modify: `cli/src/domain/types.ts`
- Modify: `cli/src/domain/aggregator.ts`
- Modify: `cli/src/domain/session-extractor.ts`
- Create: `cli/src/domain/project-identity.ts` — canonical project identity, HMAC hashing, and display labels.
- Modify: `cli/src/infrastructure/config/manager.ts`
- Modify: `cli/src/infrastructure/api/client.ts`
- Modify: `cli/src/services/sync-service.ts`
- Modify: `cli/src/commands/init.ts`
- Modify: `cli/src/parsers/claude-code.ts`
- Modify: `cli/src/parsers/codex.ts`
- Modify: `cli/src/parsers/copilot-cli.ts`
- Modify: `cli/src/parsers/gemini-cli.ts`
- Modify: `cli/src/parsers/openclaw.ts`
- Modify: `cli/src/parsers/opencode.ts`

### Tests and supporting config

- Modify: `web/package.json`
- Modify: `cli/package.json`
- Create: `web/vitest.config.ts`
- Create: `cli/vitest.config.ts`
- Create: `web/lib/usage/api-keys.test.ts`
- Create: `web/lib/usage/contracts.test.ts`
- Create: `web/lib/usage/date-range.test.ts`
- Create: `web/lib/usage/project.test.ts`
- Create: `web/lib/validators/auth.ts`
- Create: `web/lib/validators/auth.test.ts`
- Create: `cli/src/domain/aggregator.test.ts`
- Create: `cli/src/domain/project-identity.test.ts`
- Create: `cli/src/domain/session-extractor.test.ts`

### Docs

- Modify: `README.md`
- Modify: `web/README.md`

---

## Task 1: Bootstrap dependencies, scripts, and UI primitives

**Files:**
- Modify: `web/package.json`
- Modify: `cli/package.json`
- Create: `web/vitest.config.ts`
- Create: `cli/vitest.config.ts`
- Generate: `web/components/ui/alert.tsx`
- Generate: `web/components/ui/badge.tsx`
- Generate: `web/components/ui/calendar.tsx`
- Generate: `web/components/ui/card.tsx`
- Generate: `web/components/ui/dialog.tsx`
- Generate: `web/components/ui/input.tsx`
- Generate: `web/components/ui/label.tsx`
- Generate: `web/components/ui/popover.tsx`
- Generate: `web/components/ui/select.tsx`
- Generate: `web/components/ui/skeleton.tsx`
- Generate: `web/components/ui/table.tsx`
- Generate: `web/components/ui/tabs.tsx`

- [ ] **Step 1: Add the missing runtime and test dependencies**

Update `web/package.json` to include:

```json
{
  "dependencies": {
    "recharts": "^2.15.1",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  },
  "scripts": {
    "test": "vitest run"
  }
}
```

Update `cli/package.json` to include:

```json
{
  "devDependencies": {
    "vitest": "^3.2.4"
  },
  "scripts": {
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Install the new packages and regenerate the lockfile**

Run: `pnpm install`

Expected: install completes cleanly and updates `pnpm-lock.yaml`.

- [ ] **Step 3: Generate the required shadcn primitives from the repo root**

Run:

```bash
pnpm dlx shadcn@latest add alert badge calendar card dialog input label popover select skeleton table tabs --cwd web
```

Expected: the listed component files appear under `web/components/ui/`.

- [ ] **Step 4: Add minimal Vitest configs for both workspaces**

Create `web/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

Create `cli/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Verify the repo still formats and builds before feature work**

Run:

```bash
pnpm check
pnpm build
```

Expected: both commands exit `0`.

- [ ] **Step 6: Commit the bootstrap changes**

```bash
git add pnpm-lock.yaml web/package.json cli/package.json web/vitest.config.ts cli/vitest.config.ts web/components/ui
git commit -m "chore: add dashboard implementation deps"
```

---

## Task 2: Wire Better Auth for email/password login and protected routes

**Files:**
- Modify: `web/lib/auth.ts`
- Create: `web/lib/auth-client.ts`
- Create: `web/lib/session.ts`
- Create: `web/app/api/auth/[...all]/route.ts`
- Create: `web/proxy.ts`
- Modify: `web/app/page.tsx`

- [ ] **Step 1: Update the Better Auth server config to enable email/password**

Modify `web/lib/auth.ts` to follow Better Auth’s email/password configuration:

```ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
```

- [ ] **Step 2: Create the browser auth client**

Create `web/lib/auth-client.ts`:

```ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});
```

- [ ] **Step 3: Mount Better Auth under `/api/auth/[...all]`**

Create `web/app/api/auth/[...all]/route.ts`:

```ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

- [ ] **Step 4: Add server-side session helpers for protected pages**

Create `web/lib/session.ts`:

```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export async function getOptionalSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getSessionOrRedirect() {
  const session = await getOptionalSession();
  if (!session) redirect("/login");
  return session;
}
```

- [ ] **Step 5: Add optimistic route protection using Next.js 16 `proxy.ts`**

Create `web/proxy.ts`:

```ts
import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/usage", "/settings"];

export function proxy(request: NextRequest) {
  if (!PROTECTED.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/usage/:path*", "/settings/:path*"],
};
```

- [ ] **Step 6: Replace the placeholder home page with an auth-aware redirect**

Modify `web/app/page.tsx`:

```tsx
import { redirect } from "next/navigation";

import { getOptionalSession } from "@/lib/session";

export default async function Home() {
  const session = await getOptionalSession();
  redirect(session ? "/usage" : "/login");
}
```

- [ ] **Step 7: Verify auth plumbing compiles**

Run: `pnpm --filter ./web build`

Expected: Next.js build succeeds and types resolve for `auth.api.getSession()`.

- [ ] **Step 8: Commit the auth foundation**

```bash
git add web/lib/auth.ts web/lib/auth-client.ts web/lib/session.ts web/app/api/auth web/proxy.ts web/app/page.tsx
git commit -m "feat(web): add better-auth session foundation"
```

---

## Task 3: Build login and registration pages

**Files:**
- Create: `web/lib/validators/auth.ts`
- Test: `web/lib/validators/auth.test.ts`
- Create: `web/components/auth/auth-shell.tsx`
- Create: `web/components/auth/login-form.tsx`
- Create: `web/components/auth/register-form.tsx`
- Create: `web/components/auth/logout-button.tsx`
- Create: `web/app/login/page.tsx`
- Create: `web/app/register/page.tsx`

- [ ] **Step 1: Write failing validator tests for login and registration forms**

Create `web/lib/validators/auth.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./auth";

describe("registerSchema", () => {
  it("rejects short passwords", () => {
    const result = registerSchema.safeParse({
      name: "Qi",
      email: "qi@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a valid email", () => {
    const result = loginSchema.safeParse({
      email: "bad-email",
      password: "password123",
    });

    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the auth validator tests and confirm they fail**

Run: `pnpm --filter ./web test -- web/lib/validators/auth.test.ts`

Expected: FAIL because `web/lib/validators/auth.ts` does not exist yet.

- [ ] **Step 3: Implement the auth schemas**

Create `web/lib/validators/auth.ts`:

```ts
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});
```

- [ ] **Step 4: Re-run the auth validator tests**

Run: `pnpm --filter ./web test -- web/lib/validators/auth.test.ts`

Expected: PASS.

- [ ] **Step 5: Build reusable auth UI shells and forms**

Create `web/components/auth/auth-shell.tsx`:

```tsx
import type { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <section className="w-full space-y-6">{children}</section>
    </main>
  );
}
```

Create `web/components/auth/login-form.tsx` and `register-form.tsx` as client components that:

- validate with the Zod schemas before submit
- call `authClient.signIn.email()` / `authClient.signUp.email()`
- redirect to `/usage` on success
- surface Better Auth error messages in the form

Use the generated shadcn `Card`, `Input`, `Label`, `Alert`, and `Button` components.

- [ ] **Step 6: Add the route pages**

Create `web/app/login/page.tsx` and `web/app/register/page.tsx` as server components that:

- redirect authenticated users to `/usage`
- render the appropriate form inside `AuthShell`

- [ ] **Step 7: Add a reusable logout button**

Create `web/components/auth/logout-button.tsx`:

```tsx
"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      onClick={async () => {
        await authClient.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
```

- [ ] **Step 8: Smoke test the auth pages**

Run:

```bash
pnpm --filter ./web build
pnpm --filter ./web dev
```

Expected manual checks:

- `/login` renders
- `/register` renders
- visiting `/login` while authenticated redirects to `/usage`

- [ ] **Step 9: Commit the auth UI**

```bash
git add web/lib/validators/auth.ts web/lib/validators/auth.test.ts web/components/auth web/app/login web/app/register
git commit -m "feat(web): add email password auth pages"
```

---

## Task 4: Add usage persistence models and per-user preferences

**Files:**
- Modify: `web/prisma/schema.prisma`
- Modify: `web/prisma.config.ts`
- Create: generated migration under `web/prisma/migrations/*_usage_auth/`
- Modify: `web/generated/prisma/*`

- [ ] **Step 1: Extend the Prisma schema with usage-specific models**

Add these enums and models to `web/prisma/schema.prisma`:

```prisma
enum UsageApiKeyStatus {
  active
  disabled
}

enum ProjectMode {
  hashed
  raw
  disabled
}

model UsagePreference {
  id              String      @id @default(cuid())
  userId          String      @unique
  timezone        String      @default("UTC")
  projectMode     ProjectMode @default(hashed)
  projectHashSalt String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model UsageApiKey {
  id         String            @id @default(cuid())
  userId     String
  name       String
  prefix     String
  keyHash    String            @unique
  status     UsageApiKeyStatus @default(active)
  lastUsedAt DateTime?
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt
  user       User              @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status])
}

model Device {
  id           String   @id @default(cuid())
  userId       String
  deviceId     String
  hostname     String
  firstSeenAt  DateTime @default(now())
  lastSeenAt   DateTime @default(now())
  lastApiKeyId String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId])
}

model UsageBucket {
  id           String   @id @default(cuid())
  userId       String
  apiKeyId     String?
  deviceId     String
  source       String
  model        String
  projectKey   String
  projectLabel String
  bucketStart  DateTime
  inputTokens  Int
  outputTokens Int
  cachedTokens Int
  totalTokens  Int
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId, source, model, projectKey, bucketStart])
  @@index([userId, bucketStart])
}

model UsageSession {
  id               String   @id @default(cuid())
  userId           String
  apiKeyId         String?
  deviceId         String
  source           String
  projectKey       String
  projectLabel     String
  sessionHash      String
  firstMessageAt   DateTime
  lastMessageAt    DateTime
  durationSeconds  Int
  activeSeconds    Int
  messageCount     Int
  userMessageCount Int
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, deviceId, source, sessionHash])
  @@index([userId, firstMessageAt])
}
```

Also add relations on `User`:

```prisma
usagePreference UsagePreference?
usageApiKeys    UsageApiKey[]
devices         Device[]
usageBuckets    UsageBucket[]
usageSessions   UsageSession[]
```

- [ ] **Step 2: Fix the Prisma config lint warning while the file is open**

Replace:

```ts
url: process.env["DATABASE_URL"],
```

with:

```ts
url: process.env.DATABASE_URL,
```

- [ ] **Step 3: Generate and apply the migration**

Run:

```bash
pnpm --filter ./web exec prisma migrate dev --name usage-auth
pnpm --filter ./web exec prisma generate
```

Expected: Prisma creates the migration and regenerates `web/generated/prisma/`.

- [ ] **Step 4: Validate the Prisma schema and generated client**

Run:

```bash
pnpm --filter ./web exec prisma validate
pnpm --filter ./web build
```

Expected: both commands exit `0`.

- [ ] **Step 5: Commit the schema changes**

```bash
git add web/prisma/schema.prisma web/prisma.config.ts web/prisma/migrations web/generated/prisma
git commit -m "feat(web): add usage persistence schema"
```

---

## Task 5: Implement usage settings, API key management, and ingest helpers on the web

**Files:**
- Create: `web/lib/usage/types.ts`
- Create: `web/lib/usage/contracts.ts`
- Test: `web/lib/usage/contracts.test.ts`
- Create: `web/lib/usage/preferences.ts`
- Create: `web/lib/usage/api-keys.ts`
- Test: `web/lib/usage/api-keys.test.ts`
- Create: `web/lib/usage/project.ts`
- Test: `web/lib/usage/project.test.ts`
- Create: `web/app/api/usage/settings/route.ts`
- Create: `web/app/api/usage/keys/route.ts`
- Create: `web/app/api/usage/keys/[id]/route.ts`
- Create: `web/app/api/usage/preferences/route.ts`

- [ ] **Step 1: Write failing tests for API key generation, hashing, and project label formatting**

Create `web/lib/usage/api-keys.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { generateUsageApiKey, hashUsageApiKey, splitApiKeyPrefix } from "./api-keys";

describe("usage api keys", () => {
  it("generates vbu_ prefixed keys", () => {
    const key = generateUsageApiKey();
    expect(key.raw.startsWith("vbu_")).toBe(true);
    expect(key.prefix).toBe(key.raw.slice(0, 12));
  });

  it("hashes deterministically", () => {
    expect(hashUsageApiKey("vbu_test")).toBe(hashUsageApiKey("vbu_test"));
  });

  it("extracts the display prefix", () => {
    expect(splitApiKeyPrefix("vbu_1234567890abcdef")).toBe("vbu_12345678");
  });
});
```

Create `web/lib/usage/project.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { formatProjectLabel } from "./project";

describe("formatProjectLabel", () => {
  it("renders hashed project labels", () => {
    expect(formatProjectLabel("hashed", "a1b2c3d4e5f6")).toBe("Project a1b2c3");
  });
});
```

- [ ] **Step 2: Run the usage helper tests and confirm they fail**

Run:

```bash
pnpm --filter ./web test -- web/lib/usage/api-keys.test.ts
pnpm --filter ./web test -- web/lib/usage/project.test.ts
```

Expected: FAIL because the helper files do not exist yet.

- [ ] **Step 3: Implement the usage key helpers and shared types**

Create `web/lib/usage/api-keys.ts`:

```ts
import { createHash, randomBytes } from "node:crypto";

export function hashUsageApiKey(raw: string) {
  return createHash("sha256").update(raw).digest("hex");
}

export function splitApiKeyPrefix(raw: string) {
  return raw.slice(0, 12);
}

export function generateUsageApiKey() {
  const raw = `vbu_${randomBytes(24).toString("hex")}`;
  return {
    raw,
    prefix: splitApiKeyPrefix(raw),
    keyHash: hashUsageApiKey(raw),
  };
}
```

Create `web/lib/usage/project.ts`:

```ts
import type { ProjectMode } from "@/generated/prisma/enums";

export function formatProjectLabel(mode: ProjectMode, projectKey: string, rawName?: string | null) {
  if (mode === "raw" && rawName) return rawName;
  if (mode === "disabled") return "Unknown Project";
  return `Project ${projectKey.slice(0, 6)}`;
}
```

Create `web/lib/usage/types.ts` and `contracts.ts` with:

- `schemaVersion = 2`
- `ProjectMode = "hashed" | "raw" | "disabled"`
- Zod schemas for:
  - ingest request body
  - dashboard query params
  - key create/update payloads
  - preferences update payloads

- [ ] **Step 4: Re-run the usage helper tests**

Run:

```bash
pnpm --filter ./web test -- web/lib/usage/api-keys.test.ts
pnpm --filter ./web test -- web/lib/usage/project.test.ts
```

Expected: PASS.

- [ ] **Step 5: Implement preference and API key data helpers**

Create `web/lib/usage/preferences.ts` with:

- `ensureUsagePreference(userId)` — creates default `{ timezone: "UTC", projectMode: "hashed", projectHashSalt: randomHex }`
- `getUsagePreference(userId)`
- `updateUsagePreference(userId, input)`

Create `web/lib/usage/api-keys.ts` Prisma CRUD helpers:

- `createUsageApiKey(userId, name)`
- `listUsageApiKeys(userId)`
- `updateUsageApiKey(userId, id, { name, status })`
- `deleteUsageApiKey(userId, id)`
- `findUsageApiKeyByRaw(rawKey)`

Make `findUsageApiKeyByRaw()` reject disabled keys.

- [ ] **Step 6: Implement settings, key CRUD, and preference routes**

Implement:

- `web/app/api/usage/settings/route.ts`
  - Bearer auth against `UsageApiKey`
  - return `{ schemaVersion, projectMode, projectHashSalt, timezone }`
- `web/app/api/usage/keys/route.ts`
  - `GET` list keys for current session user
  - `POST` create a new key and return the raw key once
- `web/app/api/usage/keys/[id]/route.ts`
  - `PATCH` rename / enable / disable
  - `DELETE` delete
- `web/app/api/usage/preferences/route.ts`
  - `GET` read timezone + project mode
  - `PATCH` update them

All browser-facing routes should require a valid Better Auth session via `getSessionOrRedirect()` or a route-local equivalent.

- [ ] **Step 7: Smoke test key creation and settings routes**

Run: `pnpm --filter ./web build`

Expected: build passes and route handlers type-check.

- [ ] **Step 8: Commit settings and key management**

```bash
git add web/lib/usage web/app/api/usage/settings web/app/api/usage/keys web/app/api/usage/preferences
git commit -m "feat(web): add usage settings and api key management"
```

---

## Task 6: Implement the ingest endpoint and canonical upsert pipeline

**Files:**
- Create: `web/lib/usage/ingest.ts`
- Modify: `web/lib/usage/contracts.ts`
- Test: `web/lib/usage/contracts.test.ts`
- Create: `web/app/api/usage/ingest/route.ts`

- [ ] **Step 1: Write failing ingest-contract tests**

Create `web/lib/usage/contracts.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { ingestRequestSchema } from "./contracts";

describe("ingestRequestSchema", () => {
  it("requires schemaVersion and device metadata", () => {
    const result = ingestRequestSchema.safeParse({
      buckets: [],
      sessions: [],
    });

    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run the ingest-contract test and confirm it fails**

Run: `pnpm --filter ./web test -- web/lib/usage/contracts.test.ts`

Expected: FAIL until `ingestRequestSchema` exists.

- [ ] **Step 3: Implement the canonical ingest contract**

In `web/lib/usage/contracts.ts`, define:

```ts
export const ingestRequestSchema = z.object({
  schemaVersion: z.literal(2),
  device: z.object({
    deviceId: z.string().min(8),
    hostname: z.string().min(1),
  }),
  buckets: z.array(
    z.object({
      source: z.string(),
      model: z.string(),
      projectKey: z.string(),
      projectLabel: z.string(),
      bucketStart: z.string().datetime(),
      inputTokens: z.number().int().nonnegative(),
      outputTokens: z.number().int().nonnegative(),
      cachedTokens: z.number().int().nonnegative(),
      totalTokens: z.number().int().nonnegative(),
    }),
  ),
  sessions: z.array(
    z.object({
      source: z.string(),
      projectKey: z.string(),
      projectLabel: z.string(),
      sessionHash: z.string(),
      firstMessageAt: z.string().datetime(),
      lastMessageAt: z.string().datetime(),
      durationSeconds: z.number().int().nonnegative(),
      activeSeconds: z.number().int().nonnegative(),
      messageCount: z.number().int().nonnegative(),
      userMessageCount: z.number().int().nonnegative(),
    }),
  ),
});
```

- [ ] **Step 4: Re-run the ingest-contract test**

Run: `pnpm --filter ./web test -- web/lib/usage/contracts.test.ts`

Expected: PASS.

- [ ] **Step 5: Implement the upsert pipeline in `web/lib/usage/ingest.ts`**

Create helpers:

- `upsertDevice()`
- `upsertBuckets()`
- `upsertSessions()`
- `ingestUsagePayload()`

Use `prisma.$transaction()` and `upsert()` with the spec’s uniqueness keys:

- bucket: `userId + deviceId + source + model + projectKey + bucketStart`
- session: `userId + deviceId + source + sessionHash`

Always update `UsageApiKey.lastUsedAt` and `Device.lastSeenAt`.

- [ ] **Step 6: Add the bearer-authenticated ingest route**

Create `web/app/api/usage/ingest/route.ts`:

```ts
import { NextResponse } from "next/server";

import { ingestRequestSchema } from "@/lib/usage/contracts";
import { findUsageApiKeyByRaw } from "@/lib/usage/api-keys";
import { ingestUsagePayload } from "@/lib/usage/ingest";

export async function POST(request: Request) {
  const rawKey = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!rawKey) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const apiKey = await findUsageApiKeyByRaw(rawKey);
  if (!apiKey) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const payload = ingestRequestSchema.parse(await request.json());
  const result = await ingestUsagePayload({
    userId: apiKey.userId,
    apiKeyId: apiKey.id,
    payload,
  });

  return NextResponse.json(result);
}
```

Keep `DELETE` support only if you still need it after the current feature; otherwise omit it from this scope.

- [ ] **Step 7: Verify the ingest route**

Run: `pnpm --filter ./web build`

Expected: build succeeds with the new route.

- [ ] **Step 8: Commit the ingest implementation**

```bash
git add web/lib/usage/contracts.ts web/lib/usage/contracts.test.ts web/lib/usage/ingest.ts web/app/api/usage/ingest
git commit -m "feat(web): add usage ingest pipeline"
```

---

## Task 7: Update the CLI contract, device identity, and privacy pipeline

**Files:**
- Modify: `cli/src/domain/types.ts`
- Create: `cli/src/domain/project-identity.ts`
- Test: `cli/src/domain/project-identity.test.ts`
- Modify: `cli/src/infrastructure/config/manager.ts`
- Modify: `cli/src/infrastructure/api/client.ts`
- Modify: `cli/src/services/sync-service.ts`
- Modify: `cli/src/commands/init.ts`

- [ ] **Step 1: Write failing tests for project hashing and labels**

Create `cli/src/domain/project-identity.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { toProjectIdentity } from "./project-identity";

describe("toProjectIdentity", () => {
  it("hashes projects in hashed mode", () => {
    const result = toProjectIdentity({
      project: "tokens-burned",
      mode: "hashed",
      salt: "secret-salt",
    });

    expect(result.projectKey).toHaveLength(16);
    expect(result.projectLabel).toBe(`Project ${result.projectKey.slice(0, 6)}`);
  });
});
```

- [ ] **Step 2: Run the CLI identity test and confirm it fails**

Run: `pnpm --filter ./cli test -- cli/src/domain/project-identity.test.ts`

Expected: FAIL because the helper file does not exist yet.

- [ ] **Step 3: Update the CLI domain types to the v2 payload**

Modify `cli/src/domain/types.ts` so the upload-facing shapes become:

```ts
export interface TokenUsageEntry {
  source: string;
  model: string;
  project: string;
  timestamp: Date;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
}

export interface TokenBucket {
  source: string;
  model: string;
  projectKey: string;
  projectLabel: string;
  bucketStart: string;
  deviceId: string;
  hostname: string;
  inputTokens: number;
  outputTokens: number;
  cachedTokens: number;
  totalTokens: number;
}

export interface SessionMetadata {
  source: string;
  projectKey: string;
  projectLabel: string;
  sessionHash: string;
  deviceId: string;
  hostname: string;
  firstMessageAt: string;
  lastMessageAt: string;
  durationSeconds: number;
  activeSeconds: number;
  messageCount: number;
  userMessageCount: number;
}

export interface ApiSettings {
  schemaVersion: 2;
  projectMode: "hashed" | "raw" | "disabled";
  projectHashSalt: string;
  timezone: string;
}
```

- [ ] **Step 4: Implement canonical project hashing and labels**

Create `cli/src/domain/project-identity.ts`:

```ts
import { createHmac } from "node:crypto";

export function toProjectIdentity(input: {
  project: string;
  mode: "hashed" | "raw" | "disabled";
  salt: string;
}) {
  if (input.mode === "disabled") {
    return { projectKey: "unknown", projectLabel: "Unknown Project" };
  }

  if (input.mode === "raw") {
    return { projectKey: input.project, projectLabel: input.project };
  }

  const projectKey = createHmac("sha256", input.salt)
    .update(input.project)
    .digest("hex")
    .slice(0, 16);

  return {
    projectKey,
    projectLabel: `Project ${projectKey.slice(0, 6)}`,
  };
}
```

- [ ] **Step 5: Re-run the CLI identity test**

Run: `pnpm --filter ./cli test -- cli/src/domain/project-identity.test.ts`

Expected: PASS.

- [ ] **Step 6: Persist a stable `deviceId` in CLI config**

Modify `cli/src/infrastructure/config/manager.ts`:

- add `deviceId?: string` to `Config`
- add a helper that lazily creates a random `deviceId` if absent
- save it back to the existing config file

Use a stable shape like:

```ts
import { randomUUID } from "node:crypto";

export function getOrCreateDeviceId(config: Config): string {
  if (config.deviceId) return config.deviceId;
  const next = randomUUID();
  saveConfig({ ...config, deviceId: next });
  return next;
}
```

- [ ] **Step 7: Upgrade the API client to the v2 settings + ingest payload**

Modify `cli/src/infrastructure/api/client.ts` so `sendIngest()` posts:

```ts
{
  schemaVersion: 2,
  device: {
    deviceId,
    hostname,
  },
  buckets,
  sessions,
}
```

Update `fetchSettings()` to expect `schemaVersion`, `projectMode`, `projectHashSalt`, and `timezone`.

- [ ] **Step 8: Update sync/init to require settings and apply project mode**

Modify:

- `cli/src/services/sync-service.ts`
- `cli/src/commands/init.ts`

Changes:

- fetch settings before upload; if missing, fail fast
- add `deviceId` and `hostname` to every outbound row
- transform raw project names into `{ projectKey, projectLabel }`
- keep the CLI console summary aligned with the new metric semantics

- [ ] **Step 9: Smoke test the CLI contract**

Run:

```bash
pnpm --filter ./cli build
pnpm --filter ./cli dev -- --help
pnpm --filter ./cli dev -- status
```

Expected: build succeeds and local commands still run.

- [ ] **Step 10: Commit the CLI contract updates**

```bash
git add cli/src/domain/types.ts cli/src/domain/project-identity.ts cli/src/domain/project-identity.test.ts cli/src/infrastructure/config/manager.ts cli/src/infrastructure/api/client.ts cli/src/services/sync-service.ts cli/src/commands/init.ts
git commit -m "feat(cli): add device-aware hashed uploads"
```

---

## Task 8: Normalize CLI token math and session message counts

**Files:**
- Modify: `cli/src/domain/aggregator.ts`
- Test: `cli/src/domain/aggregator.test.ts`
- Modify: `cli/src/domain/session-extractor.ts`
- Test: `cli/src/domain/session-extractor.test.ts`
- Modify: `cli/src/parsers/claude-code.ts`
- Modify: `cli/src/parsers/codex.ts`
- Modify: `cli/src/parsers/copilot-cli.ts`
- Modify: `cli/src/parsers/gemini-cli.ts`
- Modify: `cli/src/parsers/openclaw.ts`
- Modify: `cli/src/parsers/opencode.ts`

- [ ] **Step 1: Write failing tests for total token math**

Create `cli/src/domain/aggregator.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { aggregateToBuckets } from "./aggregator";

describe("aggregateToBuckets", () => {
  it("includes cached tokens in totalTokens", () => {
    const [bucket] = aggregateToBuckets([
      {
        source: "codex",
        model: "gpt-5.4",
        project: "tokens-burned",
        timestamp: new Date("2026-03-26T10:00:00.000Z"),
        inputTokens: 100,
        outputTokens: 50,
        cachedTokens: 25,
      },
    ]);

    expect(bucket.totalTokens).toBe(175);
  });
});
```

Create `cli/src/domain/session-extractor.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { extractSessions } from "./session-extractor";

describe("extractSessions", () => {
  it("counts only user and assistant messages", () => {
    const [session] = extractSessions([
      {
        sessionId: "s1",
        source: "claude-code",
        project: "tokens-burned",
        timestamp: new Date("2026-03-26T10:00:00.000Z"),
        role: "user",
      },
      {
        sessionId: "s1",
        source: "claude-code",
        project: "tokens-burned",
        timestamp: new Date("2026-03-26T10:00:05.000Z"),
        role: "assistant",
      },
    ]);

    expect(session.messageCount).toBe(2);
    expect(session.userMessageCount).toBe(1);
  });
});
```

- [ ] **Step 2: Run the aggregator/session tests and confirm the total-token test fails**

Run:

```bash
pnpm --filter ./cli test -- cli/src/domain/aggregator.test.ts
pnpm --filter ./cli test -- cli/src/domain/session-extractor.test.ts
```

Expected: the aggregator test fails because cache is not included yet.

- [ ] **Step 3: Fix the aggregator math**

Modify `cli/src/domain/aggregator.ts`:

```ts
b.cachedTokens += e.cachedTokens || 0;
b.totalTokens += (e.inputTokens || 0) + (e.outputTokens || 0) + (e.cachedTokens || 0);
```

Also move the bucket key from raw `project` to the transformed `projectKey` once Task 7 types are in place.

- [ ] **Step 4: Re-run the aggregator test**

Run: `pnpm --filter ./cli test -- cli/src/domain/aggregator.test.ts`

Expected: PASS.

- [ ] **Step 5: Remove `reasoningOutputTokens` as a separate outbound concept**

Update every parser so `outputTokens` already includes reasoning/thought tokens:

- `codex.ts`: add `reasoning_output_tokens` into `outputTokens`
- `gemini-cli.ts`: add `thoughtsTokenCount` / `thoughts` into `outputTokens`
- `opencode.ts`: add `tokens.reasoning` into `outputTokens`
- other parsers: keep `outputTokens` as-is where reasoning is already absent

After this change, no outbound CLI type should contain `reasoningOutputTokens`.

- [ ] **Step 6: Normalize session events so message counts match the product spec**

Modify parsers so only real user/assistant messages are fed into `extractSessions()`:

- `claude-code.ts`: stop emitting `tool_use` / `tool_result` as assistant messages
- `codex.ts`: treat `turn_context` as the user-turn boundary, use the associated `token_count`/assistant response timestamp as the assistant event, and ignore `session_meta`
- `copilot-cli.ts`, `gemini-cli.ts`, `openclaw.ts`, `opencode.ts`: keep only `user` + `assistant`

If a parser cannot recover perfect message semantics, prefer under-counting internal events rather than inflating `messageCount`.

- [ ] **Step 7: Re-run the session extractor test**

Run: `pnpm --filter ./cli test -- cli/src/domain/session-extractor.test.ts`

Expected: PASS.

- [ ] **Step 8: Smoke test CLI parsing and summaries**

Run:

```bash
pnpm --filter ./cli build
pnpm --filter ./cli dev -- status
```

Expected: build passes and the CLI summary still prints parser status.

- [ ] **Step 9: Commit the CLI normalization changes**

```bash
git add cli/src/domain/aggregator.ts cli/src/domain/aggregator.test.ts cli/src/domain/session-extractor.ts cli/src/domain/session-extractor.test.ts cli/src/parsers
git commit -m "feat(cli): normalize token and session metrics"
```

---

## Task 9: Add dashboard query helpers and browser-facing usage APIs

**Files:**
- Create: `web/lib/usage/date-range.ts`
- Test: `web/lib/usage/date-range.test.ts`
- Create: `web/lib/usage/queries.ts`
- Create: `web/app/api/usage/dashboard/route.ts`
- Create: `web/app/api/usage/filters/route.ts`

- [ ] **Step 1: Write failing date-range tests**

Create `web/lib/usage/date-range.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import { resolveDashboardRange } from "./date-range";

describe("resolveDashboardRange", () => {
  it("uses hourly buckets for 1D", () => {
    const result = resolveDashboardRange({
      preset: "1d",
      timezone: "UTC",
      now: new Date("2026-03-26T12:00:00.000Z"),
    });

    expect(result.granularity).toBe("hour");
  });
});
```

- [ ] **Step 2: Run the date-range test and confirm it fails**

Run: `pnpm --filter ./web test -- web/lib/usage/date-range.test.ts`

Expected: FAIL because the helper does not exist yet.

- [ ] **Step 3: Implement range parsing and comparison-period helpers**

Create `web/lib/usage/date-range.ts` with:

- `resolveDashboardRange({ preset, from, to, timezone, now })`
- `getPreviousRange(range)`
- `groupByHourOrDay(range)`

Keep the return shape explicit:

```ts
type DashboardRange = {
  from: Date;
  to: Date;
  granularity: "hour" | "day";
};
```

- [ ] **Step 4: Re-run the date-range test**

Run: `pnpm --filter ./web test -- web/lib/usage/date-range.test.ts`

Expected: PASS.

- [ ] **Step 5: Implement canonical dashboard query helpers**

Create `web/lib/usage/queries.ts` with functions:

- `getOverviewMetrics(input)`
- `getTokenTrend(input)`
- `getActivityTrend(input)`
- `getBreakdowns(input)`
- `getFilterOptions(userId)`
- `getLastSyncedAt(userId)`

Implementation rules:

- always scope by `userId`
- apply optional filters (`apiKeyId`, `deviceId`, `source`, `model`, `projectKey`)
- group token data from `UsageBucket`
- group activity/message data from `UsageSession`
- compare current range against `getPreviousRange()`

- [ ] **Step 6: Add the dashboard and filter routes**

Create:

- `web/app/api/usage/dashboard/route.ts`
- `web/app/api/usage/filters/route.ts`

Both routes should:

- require a Better Auth session
- parse query params through `contracts.ts`
- call `queries.ts`
- return JSON only

- [ ] **Step 7: Verify the query layer compiles**

Run:

```bash
pnpm --filter ./web test -- web/lib/usage/date-range.test.ts
pnpm --filter ./web build
```

Expected: both commands pass.

- [ ] **Step 8: Commit the dashboard API layer**

```bash
git add web/lib/usage/date-range.ts web/lib/usage/date-range.test.ts web/lib/usage/queries.ts web/app/api/usage/dashboard web/app/api/usage/filters
git commit -m "feat(web): add dashboard query api"
```

---

## Task 10: Build `/usage`, `/usage/setup`, and `/settings/keys`

**Files:**
- Create: `web/components/usage/filters-bar.tsx`
- Create: `web/components/usage/kpi-grid.tsx`
- Create: `web/components/usage/token-trend-card.tsx`
- Create: `web/components/usage/activity-trend-card.tsx`
- Create: `web/components/usage/breakdown-tabs.tsx`
- Create: `web/components/usage/breakdown-table.tsx`
- Create: `web/components/usage/empty-state.tsx`
- Create: `web/components/usage/setup-card.tsx`
- Create: `web/components/usage/key-manager.tsx`
- Create: `web/components/usage/key-dialog.tsx`
- Create: `web/app/usage/page.tsx`
- Create: `web/app/usage/setup/page.tsx`
- Create: `web/app/settings/keys/page.tsx`

- [ ] **Step 1: Build the `/usage` server page around URL search params**

Create `web/app/usage/page.tsx` as a server component that:

- calls `getSessionOrRedirect()`
- loads `UsagePreference`
- resolves the dashboard range from `searchParams`
- calls `getOverviewMetrics()`, `getTokenTrend()`, `getActivityTrend()`, `getBreakdowns()`, and `getFilterOptions()`
- renders an empty state when no bucket/session data exists

- [ ] **Step 2: Build the filter bar as a client component that edits the URL**

Create `web/components/usage/filters-bar.tsx` with:

- preset buttons: `1D`, `7D`, `30D`, `Custom`
- select inputs for keys/devices/tools/models/projects
- reset button
- URL synchronization via `useRouter()` + `useSearchParams()`

Do not duplicate server state in React state beyond the controlled form values needed to update the URL.

- [ ] **Step 3: Build the KPI grid and trend cards**

Create:

- `kpi-grid.tsx`
- `token-trend-card.tsx`
- `activity-trend-card.tsx`

Use `Card` + Recharts and keep the copy aligned to the product spec:

- Total Tokens
- Input Tokens
- Output Tokens
- Cached Tokens
- Active Time
- Total Time
- Sessions
- Messages
- User Messages

- [ ] **Step 4: Build the Devices / Tools / Models / Projects breakdown tabs**

Create:

- `breakdown-tabs.tsx`
- `breakdown-table.tsx`

Use the same column order for every breakdown:

`Name | Total Tokens | Input | Output | Cache | Active Time | Sessions | Messages | User Messages | Share`

- [ ] **Step 5: Build `/usage/setup` for CLI onboarding and preferences**

Create `web/app/usage/setup/page.tsx` plus `setup-card.tsx` to show:

- current timezone
- current project mode
- CLI install/configure instructions
- current API keys summary
- “create key” CTA

Add a simple preference editor that calls `PATCH /api/usage/preferences`.

- [ ] **Step 6: Build `/settings/keys` for full key management**

Create `web/app/settings/keys/page.tsx`, `key-manager.tsx`, and `key-dialog.tsx` to support:

- list keys
- create key
- rename key
- enable/disable key
- delete key

Show the raw key only once, immediately after creation.

- [ ] **Step 7: Add a consistent signed-in header**

Use `LogoutButton` at the top of `/usage`, `/usage/setup`, and `/settings/keys`.

- [ ] **Step 8: Smoke test the usage UI**

Run:

```bash
pnpm --filter ./web build
pnpm --filter ./web dev
```

Expected manual checks:

- `/usage` redirects to `/login` when signed out
- `/usage` shows empty state for a new account
- `/usage/setup` can update timezone and project mode
- `/settings/keys` can create and disable a key

- [ ] **Step 9: Commit the web UI**

```bash
git add web/components/usage web/app/usage web/app/settings/keys
git commit -m "feat(web): add usage dashboard pages"
```

---

## Task 11: Full-stack verification, README updates, and final cleanup

**Files:**
- Modify: `README.md`
- Modify: `web/README.md`

- [ ] **Step 1: Update the README files for the new flow**

Document:

- Web registration/login
- where to create CLI API keys
- `tokens-burned init`
- expected dashboard URL (`/usage`)
- required env vars for `web`

- [ ] **Step 2: Run the full repo validation gates**

Run:

```bash
pnpm check
pnpm build
```

Expected: both commands exit `0`.

- [ ] **Step 3: Run targeted workspace tests**

Run:

```bash
pnpm --filter ./web test
pnpm --filter ./cli test
```

Expected: all Vitest suites pass.

- [ ] **Step 4: Perform the end-to-end manual flow**

Manual verification checklist:

1. Register a new user at `/register`
2. Sign in and confirm redirect to `/usage`
3. Create a usage API key from `/settings/keys`
4. Update timezone + project mode at `/usage/setup`
5. Run `pnpm --filter ./cli dev -- init` and paste the new key
6. Run a sync against the local/target web server
7. Confirm:
   - total tokens include cache
   - output tokens include reasoning
   - project names show hashed labels in `hashed` mode
   - device breakdown shows the current host

- [ ] **Step 5: Check git status for generated/accidental files**

Run: `git status --short`

Expected: only intentional source, migration, docs, and generated Prisma files are present.

- [ ] **Step 6: Commit docs and final verification fixes**

```bash
git add README.md web/README.md
git commit -m "docs: document auth and usage setup"
```

- [ ] **Step 7: Prepare the branch for execution handoff**

Before handing off:

- capture the exact migration name
- note any env vars added
- note any follow-up items that were intentionally deferred
