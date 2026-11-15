---
name: create-component
description: Use when creating or modifying a React component in this repo (src/components). Covers file layout, keeping logic out of JSX, size limits and splitting, and the required test file.
---

# Create a component

## Rules

1. **No JS logic in JSX.** JSX only renders values that already exist. Move everything else above the `return`:
   - calculations, formatting, filtering/sorting/mapping, conditionals that decide *what* to show → named variables
   - event handlers with more than a trivial one-line call → named functions
   - stateful or reusable logic → a custom hook (`useXyz`) in the same folder
   - pure, non-UI logic → `src/lib/` (this is also where coverage is enforced)

   Simple `cond && <X />`, a ternary between two elements, and `items.map(...)` returning a single child element are fine. Anything more complex gets a variable or its own component.
2. **Small components.** Split whenever a part of the markup has a name of its own, is repeated, or has its own logic. Hard limit: **300 lines per file**, but aim much lower. Do not wait until the limit is hit.
3. **Money is integer paise**, never floats. Format only at the edge, using a helper from `src/lib/`.
4. **Every component gets a co-located test file** (`Foo.tsx` + `Foo.test.tsx`). Follow the `write-tests` skill.
5. Components in `src/components/`; routes and layouts in `src/app/` stay thin and hold no business logic.

## Conventions

- One component per file, named export, file name = component name (`ExpenseRow.tsx`).
- Typed props with an explicit `Props` type; no `any`.
- Server Components by default; add `"use client"` only when the component needs state, effects or browser APIs, and keep the client part as small as possible.
- Import with the `@/` alias, not deep relative paths.
- Styling with Tailwind classes; no inline `style` unless the value is dynamic.
- Read the relevant guide in `node_modules/next/dist/docs/` before using Next-specific APIs; this Next.js version differs from older ones.

## Pattern

```tsx
type Props = { amountPaise: number; label: string };

export function ExpenseRow({ amountPaise, label }: Props) {
  // logic first
  const amount = formatPaise(amountPaise);

  // JSX only renders
  return (
    <li>
      <span>{label}</span>
      <span>{amount}</span>
    </li>
  );
}
```

## Before finishing

- `npm run lint && npm run typecheck && npm run test:coverage`
- No file over 300 lines; no logic inline in JSX; test file exists.
