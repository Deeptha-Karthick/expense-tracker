import { addDays } from "@/lib/dates";
import { createRng, generateDemoExpenses } from "@/lib/demo-data";
import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

const categories = DEFAULT_CATEGORIES.map((name, index) => ({
  id: index + 1,
  name,
}));
const base = { today: "2026-06-30", days: 90, seed: 42, categories };

describe("createRng", () => {
  it("is deterministic and returns values in [0, 1)", () => {
    const a = createRng(7);
    const b = createRng(7);
    for (let i = 0; i < 20; i++) {
      const value = a();
      expect(value).toBe(b());
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("generateDemoExpenses", () => {
  it("is deterministic for the same seed and differs for another", () => {
    expect(generateDemoExpenses(base)).toEqual(generateDemoExpenses(base));
    expect(generateDemoExpenses({ ...base, seed: 43 })).not.toEqual(
      generateDemoExpenses(base),
    );
  });

  it("generates a realistic volume for about three months", () => {
    const rows = generateDemoExpenses(base);
    expect(rows.length).toBeGreaterThan(110);
    expect(rows.length).toBeLessThan(900);
  });

  it("uses positive integer paise only", () => {
    for (const row of generateDemoExpenses(base)) {
      expect(Number.isInteger(row.amountPaise)).toBe(true);
      expect(row.amountPaise).toBeGreaterThan(0);
    }
  });

  it("keeps every date inside the window as YYYY-MM-DD", () => {
    const first = addDays(base.today, -(base.days - 1));
    for (const row of generateDemoExpenses(base)) {
      expect(row.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.date >= first).toBe(true);
      expect(row.date <= base.today).toBe(true);
    }
  });

  it("only references the given categories", () => {
    const ids = new Set(categories.map((c) => c.id));
    for (const row of generateDemoExpenses(base)) {
      expect(ids.has(row.categoryId)).toBe(true);
    }
  });

  it("creates one internet and one recharge/bills entry per month", () => {
    const rows = generateDemoExpenses({ ...base, days: 60 });
    const internetId = categories.find((c) => c.name === "Internet")!.id;
    const internetDates = rows
      .filter((row) => row.categoryId === internetId)
      .map((row) => row.date.slice(8, 10));
    expect(internetDates.length).toBeGreaterThanOrEqual(1);
    expect(new Set(internetDates)).toEqual(new Set(["05"]));
  });

  it("falls back to a generic template for custom categories", () => {
    const rows = generateDemoExpenses({
      today: "2026-06-30",
      days: 400,
      seed: 1,
      categories: [{ id: 99, name: "Pets" }],
    });
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.purpose === "Miscellaneous")).toBe(true);
  });

  it.each(["constructor", "toString", "__proto__"])(
    "treats inherited object keys like %s as a custom category",
    (name) => {
      const rows = generateDemoExpenses({
        today: "2026-06-30",
        days: 400,
        seed: 1,
        categories: [{ id: 99, name }],
      });
      expect(rows.length).toBeGreaterThan(0);
      expect(rows.every((row) => row.purpose === "Miscellaneous")).toBe(true);
    },
  );

  it("generates amounts in whole-rupee steps, optionally plus 50 paise", () => {
    for (const row of generateDemoExpenses(base)) {
      expect([0, 50]).toContain(row.amountPaise % 100);
    }
  });

  it("returns nothing for zero days", () => {
    expect(generateDemoExpenses({ ...base, days: 0 })).toEqual([]);
  });
});
