# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Expense tracker built with Claude. Scaffolding only so far; no features yet.

## Stack

- Next.js 16 (App Router, `src/` layout, Turbopack), React 19, TypeScript, Tailwind v4
- ESLint 9 (flat config)
- Vitest 5 + React Testing Library + jest-dom, jsdom, v8 coverage
- Next.js 16 has breaking changes: read the relevant guide in `node_modules/next/dist/docs/` before writing Next code (see `AGENTS.md`).

## Commands

- `npm run dev` / `build` / `start`
- `npm run lint`
- `npm run typecheck` (runs `next typegen` first, which `tsc` needs for `LayoutProps`)
- `npm test`
- `npm run test:coverage`
- Single test: `npx vitest run src/lib/foo.test.ts` or `npx vitest run -t "name"`

## Folder structure

- `src/app/`: routes and layouts only; excluded from coverage
- `src/components/`: React components, each with a co-located `*.test.tsx`
- `src/lib/`: non-UI logic, each file with a co-located `*.test.ts`
- `src/test/`: Vitest setup (`setup.ts`)
- `vitest.config.mts`: must stay `.mts`
- `.env.local` is gitignored; don't read or edit it. `.env.example` lists the expected variables.

## Conventions

- All work goes through PRs; never commit to `main`.
- Money is stored as integer paise, never floats.
- Every component needs a test file.
- Coverage covers `src/components/**` and `src/lib/**` with a per-file 70% threshold (lines, branches, functions, statements). Keep logic out of `src/app/`.
- Write JSON files without a BOM (PowerShell 5.1 `Set-Content -Encoding utf8` adds one and breaks the build).
