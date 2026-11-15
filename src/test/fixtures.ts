import type { CategoryDTO, ExpenseDTO, SummaryResponse } from "@/lib/api-client";

export function makeExpense(overrides: Partial<ExpenseDTO> = {}): ExpenseDTO {
  return {
    id: 1,
    date: "2026-06-15",
    purpose: "Lunch",
    amountPaise: 25050,
    categoryId: 3,
    categoryName: "Dine out",
    merchant: "Cafe Coffee Day",
    paymentMethod: "UPI",
    notes: "With the team",
    createdAt: "2026-06-15T08:00:00.000Z",
    updatedAt: "2026-06-15T08:00:00.000Z",
    ...overrides,
  };
}

export function makeCategory(overrides: Partial<CategoryDTO> = {}): CategoryDTO {
  return {
    id: 3,
    name: "Dine out",
    isDefault: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export const CATEGORIES: CategoryDTO[] = [
  makeCategory({ id: 1, name: "Groceries" }),
  makeCategory({ id: 3, name: "Dine out" }),
  makeCategory({ id: 13, name: "Pets", isDefault: false }),
];

export const SUMMARY: SummaryResponse = {
  range: { from: "2026-06-01", to: "2026-06-30" },
  totalPaise: 100000,
  byCategory: [
    { categoryId: 1, name: "Groceries", totalPaise: 75000, count: 3, percentage: 75 },
    { categoryId: 3, name: "Dine out", totalPaise: 25000, count: 1, percentage: 25 },
  ],
};

export const RANGE = { from: "2026-05-31", to: "2026-06-30" };
