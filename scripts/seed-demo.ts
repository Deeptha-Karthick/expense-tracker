import { todayInKolkata } from "@/lib/dates";
import { generateDemoExpenses } from "@/lib/demo-data";
import { assertNotProduction } from "@/lib/guards";
import {
  insertDefaultCategories,
  listCategories,
} from "@/lib/repositories/categories";
import { countExpenses, insertExpenses } from "@/lib/repositories/expenses";

const DEMO_DAYS = 90;
const DEMO_SEED = 20260101;

async function main() {
  // First thing, before any database access.
  assertNotProduction();

  const force = process.argv.includes("--force");
  const existing = await countExpenses();
  if (existing > 0 && !force) {
    throw new Error(
      `Refusing to seed: ${existing} expenses already exist. Use --force to add demo data anyway.`,
    );
  }

  await insertDefaultCategories();
  const categories = await listCategories();

  const rows = generateDemoExpenses({
    today: todayInKolkata(),
    days: DEMO_DAYS,
    seed: DEMO_SEED,
    categories,
  });
  const inserted = await insertExpenses(rows);
  console.log(`Inserted ${inserted} demo expenses over ${DEMO_DAYS} days.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
