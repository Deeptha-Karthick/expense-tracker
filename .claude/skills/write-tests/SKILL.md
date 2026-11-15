---
name: write-tests
description: Use when writing or updating tests in this repo (Vitest + React Testing Library + jsdom). Covers file placement, query and assertion style, and the per-file 70% coverage requirement.
---

# Write tests

## Setup in this repo

- Vitest with `globals: true`, jsdom, jest-dom matchers and automatic RTL cleanup (`src/test/setup.ts`). No manual `cleanup()` or jest-dom imports are needed.
- Tests are `*.test.ts` / `*.test.tsx` **co-located** next to the file under test, anywhere in `src/`.
- Use the `@/` alias for imports.

## Rules

1. **Every component has a test file; every `src/lib` file has a test file.**
2. **Coverage is per file, 70%** for lines, branches, functions and statements, in `src/components/**` and `src/lib/**`. A file under 70% on any metric fails CI, so cover each branch (empty state, error state, each conditional path), not only the happy path.
3. **Test behavior, not implementation.** Assert on what the user sees and does. Do not test state variables, internal function calls or CSS classes.
4. **Query like a user**, in this order: `getByRole` (with `name`) → `getByLabelText` → `getByText` → `getByTestId` as a last resort. Use `queryBy*` to assert absence and `findBy*` for async content.
5. **Interactions with `userEvent`** (`const user = userEvent.setup()`, `await user.click(...)`), not `fireEvent`.
6. **Assert with jest-dom** (`toBeInTheDocument`, `toBeDisabled`, `toHaveTextContent`, ...).
7. **Money values are integer paise** in test data. Assert the formatted output explicitly.
8. **Logic lives outside JSX** (see `create-component`), so test pure logic directly in `src/lib` unit tests. Component tests then only need to confirm that the result is rendered and handlers are wired up.
9. Keep tests independent: no shared mutable state, no reliance on order. Mock only at the boundary (network, time, randomness), never the unit under test.

## Pattern

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseRow } from "@/components/ExpenseRow";

describe("ExpenseRow", () => {
  it("shows the label and the formatted amount", () => {
    render(<ExpenseRow label="Coffee" amountPaise={15050} />);

    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("₹150.50")).toBeInTheDocument();
  });
});
```

Name tests by behavior ("shows an empty state when there are no expenses"), one behavior per `it`.

## Commands

- Single file: `npx vitest run src/components/ExpenseRow.test.tsx`
- By name: `npx vitest run -t "empty state"`
- Full gate: `npm run test:coverage`. Read the per-file table and fix any file under 70%.
