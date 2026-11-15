import { asc, desc, eq } from "drizzle-orm";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import { getDb } from "@/lib/db/client";
import { categories, type Category } from "@/lib/db/schema";

/** Defaults first, then custom categories, each alphabetically. */
export async function listCategories(): Promise<Category[]> {
  return getDb()
    .select()
    .from(categories)
    .orderBy(desc(categories.isDefault), asc(categories.name));
}

/** Returns undefined when a category with the same name (any case) exists. */
export async function createCategory(name: string): Promise<Category | undefined> {
  const [row] = await getDb()
    .insert(categories)
    .values({ name, isDefault: false })
    .onConflictDoNothing()
    .returning();
  return row;
}

export async function deleteCategory(id: number): Promise<void> {
  await getDb().delete(categories).where(eq(categories.id, id));
}

/** Idempotent: existing names (case-insensitive) are skipped. Returns rows inserted. */
export async function insertDefaultCategories(): Promise<number> {
  const inserted = await getDb()
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((name) => ({ name, isDefault: true })))
    .onConflictDoNothing()
    .returning({ id: categories.id });
  return inserted.length;
}
