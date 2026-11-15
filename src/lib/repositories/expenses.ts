import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  gte,
  lte,
  sql,
} from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import type { CategoryTotal } from "@/lib/summary";
import {
  categories,
  expenses,
  type Expense,
  type NewExpense,
} from "@/lib/db/schema";

export type ExpenseWithCategory = Expense & { categoryName: string };

const withCategory = {
  ...getTableColumns(expenses),
  categoryName: categories.name,
};

/** Newest first, inclusive date range ("YYYY-MM-DD"). */
export async function listExpenses(
  from: string,
  to: string,
): Promise<ExpenseWithCategory[]> {
  return getDb()
    .select(withCategory)
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(and(gte(expenses.date, from), lte(expenses.date, to)))
    .orderBy(desc(expenses.date), desc(expenses.id));
}

export async function getExpense(
  id: number,
): Promise<ExpenseWithCategory | undefined> {
  const [row] = await getDb()
    .select(withCategory)
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.id, id));
  return row;
}

export async function createExpense(input: NewExpense): Promise<Expense> {
  const [row] = await getDb().insert(expenses).values(input).returning();
  return row;
}

/** Returns undefined when the expense does not exist. */
export async function updateExpense(
  id: number,
  input: Partial<NewExpense>,
): Promise<Expense | undefined> {
  const [row] = await getDb()
    .update(expenses)
    .set(input)
    .where(eq(expenses.id, id))
    .returning();
  return row;
}

/** Returns false when the expense does not exist. */
export async function deleteExpense(id: number): Promise<boolean> {
  const rows = await getDb()
    .delete(expenses)
    .where(eq(expenses.id, id))
    .returning({ id: expenses.id });
  return rows.length > 0;
}

export async function insertExpenses(rows: NewExpense[]): Promise<number> {
  if (rows.length === 0) return 0;
  const inserted = await getDb()
    .insert(expenses)
    .values(rows)
    .returning({ id: expenses.id });
  return inserted.length;
}

/** Per-category totals and counts for the inclusive range; categories with no expenses are omitted. */
export async function totalsByCategory(
  from: string,
  to: string,
): Promise<CategoryTotal[]> {
  const rows = await getDb()
    .select({
      categoryId: expenses.categoryId,
      name: categories.name,
      // sum() of integers is bigint, which the driver returns as a string.
      totalPaise: sql<string>`sum(${expenses.amountPaise})`,
      count: count(),
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(and(gte(expenses.date, from), lte(expenses.date, to)))
    .groupBy(expenses.categoryId, categories.name);

  return rows.map((row) => ({ ...row, totalPaise: Number(row.totalPaise) }));
}

export async function countExpenses(): Promise<number> {
  const [row] = await getDb().select({ value: count() }).from(expenses);
  return row.value;
}
