# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Expense tracker built with Claude. Pages: `/` (expense list with a hover edit icon, detail/edit modal, add form), `/daily` (last 30 days by category grid with day and category totals) and `/summary` (range toggle, bar chart plus table).

## Stack

- Next.js 16 (App Router, `src/` layout, Turbopack), React 19, TypeScript, Tailwind v4
- ESLint 9 (flat config)
- Vitest 5 + React Testing Library + jest-dom, jsdom, v8 coverage
- zod (shared validation), axios (client-side API calls), Recharts (summary bar chart)
- Next.js 16 has breaking changes: read the relevant guide in `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`).

## Commands

- `npm run dev` / `build` / `start`
- `npm run lint`
- `npm run typecheck` (runs `next typegen` first, which `tsc` needs for `LayoutProps`)
- `npm test`
- `npm run test:coverage`
- Single test: `npx vitest run src/lib/foo.test.ts` or `npx vitest run -t "name"`
- `npm run db:generate`: generate a migration from `src/lib/db/schema.ts` into `drizzle/` (commit it; never edit applied migrations)
- `npm run db:migrate`: apply migrations to `DATABASE_URL` (Neon Postgres)
- `npm run seed:categories`: insert the default categories; idempotent and safe on production
- `npm run seed:demo`: ~3 months of fake expenses; refuses if `NODE_ENV=production` or if expenses already exist (`--force` to override)

## Folder structure

- `src/app/`: routes and layouts only; excluded from coverage
- `src/components/`: React components, each with a co-located `*.test.tsx`
- `src/lib/`: non-UI logic, each file with a co-located `*.test.ts`
- `src/lib/db/`: Drizzle `schema.ts` and the lazy `getDb()` client (needs `DATABASE_URL` only when called, so builds and CI need no database)
- `src/lib/repositories/`: data-access layer (all DB queries). `db/` and `repositories/` are excluded from coverage; keep real logic in pure `src/lib` files
- `drizzle/`: committed migrations; `drizzle.config.ts` loads `.env.local` if present
- `scripts/`: seed scripts (run with `tsx`)
- `src/lib/schemas.ts`: shared zod schemas
- `src/lib/hooks/`: data hooks (`useExpenses`, `useCategories`, `useSummary`); they live in `src/lib` so the coverage gate applies. `src/lib/api-client.ts` holds the axios calls and `getErrorMessage`.
- `src/test/`: Vitest setup (`setup.ts`, includes a jsdom `<dialog>` polyfill) and shared `fixtures.ts`
- UI conventions: amounts go through `formatINR(paise)` (`src/lib/format.ts`); rupee text input becomes paise only via `rupeesToPaise` (`src/lib/money.ts`, string math, never `x * 100`); category colors come from `categoryColor(id)` (`--cat-1..8` in `globals.css`, validated palette, stable per category id); "today" is read inside effects or handlers via `todayInKolkata()`, not during render (Cache Components prerendering).
- `vitest.config.mts`: must stay `.mts`
- `.env.local` is gitignored; don't read or edit it. `.env.example` lists the expected variables.

## Backend and database

Design decisions to hold to:

- **Money:** integer paise (`amount_paise`), never floats. Convert for display only.
- **Dates:** a plain `date` column (`YYYY-MM-DD`), not a timestamp, to avoid timezone bugs that put an expense on the wrong day. Compute "today" explicitly in `Asia/Kolkata`, because Vercel servers run in UTC.
- **Architecture:** thin route handlers, a data-access layer in `src/lib/repositories/`, and pure logic in `src/lib/` (date-window clamping, percentage math). Pure logic is easy to test and counts toward the coverage gate.
- **Validation:** zod schemas in the shared `src/lib/schemas.ts` so the frontend can reuse them (Phase 4).

Schema:

- `categories`: `id`, `name` (unique, case-insensitive), `is_default`, `created_at`
- `expenses`: `id`, `date`, `purpose`, `amount_paise` (must be > 0), `category_id` (FK), `merchant`, `payment_method`, `notes`, `created_at`, `updated_at`; index on `date`

Categories:

- Defaults (12, in `src/lib/default-categories.ts`): Groceries, Stationery, Dine out, Food delivery, Books, Internet, Medical Expenses, Recharge/Bills, Outing, Transportation cost, Clothing/Accessories, Electronic gadgets. They cannot be renamed or deleted.
- Custom categories can be created. Deleting a custom category that still has expenses returns **409 Conflict**.

API contract: see [docs/api-contract.md](docs/api-contract.md). Read it before changing routes and update it when they change.

## Conventions

- All work goes through PRs; never commit to `main`.
- Money is stored as integer paise, never floats.
- Every component needs a test file.
- Coverage covers `src/components/**` and `src/lib/**` with a per-file 70% threshold (lines, branches, functions, statements). Keep logic out of `src/app/`.
- Run Vitest from PowerShell (`npm test`), not Git Bash: under Git Bash every suite fails with "Vitest failed to find the current suite".
- Write JSON files without a BOM (PowerShell 5.1 `Set-Content -Encoding utf8` adds one and breaks the build).
