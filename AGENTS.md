# Repository Guidelines

## Project Structure & Module Organization
- `cli/` is a TypeScript Commander CLI. Keep user-facing commands in `cli/src/commands`, pure aggregation logic in `cli/src/domain`, formatting helpers in `cli/src/lib`, and sample fixture data in `cli/src/data`.
- `web/` is a Next.js App Router app. Route files live in `web/app`, global styles live in `web/app/globals.css`, and static assets live in `web/public`.
- Read `web/AGENTS.md` before changing the web workspace.

## Build, Test, and Development Commands
- `pnpm install` — install workspace dependencies from the repository root. Use Node 20+.
- `pnpm --filter ./cli dev -- daily --json` — run the CLI against the sample usage dataset.
- `pnpm --filter ./cli build` — bundle the CLI with `tsup` into `cli/dist/`.
- `pnpm --filter ./web dev` — start the Next.js development server.
- `pnpm --filter ./web build` — create a production build for the web app.
- `pnpm --filter ./web lint` — run ESLint for the web workspace.
- Prefer path-based filters (`./cli`, `./web`); package-name filters currently overlap with the root package.

## Coding Style & Naming Conventions
- Use TypeScript + ESM in active workspaces.
- Match the existing style: 2-space indentation, double quotes, semicolons, and trailing commas in multiline objects and calls.
- Keep CLI module filenames in kebab-case (for example, `summarize-daily-usage.ts`); use PascalCase only for React components.
- Put pure transforms in `domain/`; keep console output and UI rendering in `lib/`, command handlers, or React files.

## Testing Guidelines
- There is no committed test runner yet. When adding non-trivial logic, introduce focused `*.test.ts` or `*.test.tsx` files alongside the code you change.
- Until a shared test setup exists, include manual verification in every PR: run `pnpm --filter ./web lint` and exercise CLI commands such as `daily`, `agents`, and `ingest`.

## Commit & Pull Request Guidelines
- Follow the Conventional Commit style already used in history: `feat: ...`, `fix: ...`, with optional scopes like `feat(cli): ...`.
- PRs should name the affected workspace, summarize the change, list verification commands, link related issues, and include screenshots or recordings for UI updates.
