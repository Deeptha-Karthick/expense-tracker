import { DEFAULT_CATEGORIES } from "@/lib/default-categories";
import { insertDefaultCategories } from "@/lib/repositories/categories";

/** Idempotent and insert-only: safe to run against production. */
async function main() {
  const inserted = await insertDefaultCategories();
  const skipped = DEFAULT_CATEGORIES.length - inserted;
  console.log(
    `Default categories: ${inserted} inserted, ${skipped} already present.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
