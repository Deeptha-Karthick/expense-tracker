import type { ExpenseDTO } from "@/lib/api-client";
import { addDays } from "@/lib/dates";

export const DAILY_GRID_DAYS = 30;

export type DailyCell = { totalPaise: number; count: number };

export type DailyRow = {
  date: string;
  /** Keyed by category id; a category with no expense that day has no entry. */
  cells: Record<number, DailyCell>;
  totalPaise: number;
};

export type DailyGrid = {
  /** Newest day first. */
  rows: DailyRow[];
  /** Total per category over all rows, keyed by category id. */
  columnTotals: Record<number, number>;
  grandTotalPaise: number;
};

/**
 * Lays expenses out as a day-by-category grid: one row per day for the `days` days
 * ending at `today`, one column per category in `categoryIds`. Several expenses in the
 * same cell are summed (and counted). Expenses outside the window, or in a category
 * that has no column, are ignored so every total matches what the grid shows.
 */
export function buildDailyGrid(input: {
  expenses: Pick<ExpenseDTO, "date" | "categoryId" | "amountPaise">[];
  categoryIds: number[];
  today: string;
  days?: number;
}): DailyGrid {
  const { expenses, categoryIds, today, days = DAILY_GRID_DAYS } = input;
  const columns = new Set(categoryIds);

  const rows: DailyRow[] = Array.from({ length: days }, (_, offset) => ({
    date: addDays(today, -offset),
    cells: {},
    totalPaise: 0,
  }));
  const rowByDate = new Map(rows.map((row) => [row.date, row]));
  const columnTotals: Record<number, number> = {};
  let grandTotalPaise = 0;

  for (const expense of expenses) {
    const row = rowByDate.get(expense.date);
    if (!row || !columns.has(expense.categoryId)) continue;

    const cell = row.cells[expense.categoryId] ?? { totalPaise: 0, count: 0 };
    cell.totalPaise += expense.amountPaise;
    cell.count += 1;
    row.cells[expense.categoryId] = cell;

    row.totalPaise += expense.amountPaise;
    columnTotals[expense.categoryId] =
      (columnTotals[expense.categoryId] ?? 0) + expense.amountPaise;
    grandTotalPaise += expense.amountPaise;
  }

  return { rows, columnTotals, grandTotalPaise };
}
