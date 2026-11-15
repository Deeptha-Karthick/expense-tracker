import { buildSummary, percentageOf } from "@/lib/summary";

const row = (
  categoryId: number,
  name: string,
  totalPaise: number,
  count = 1,
) => ({ categoryId, name, totalPaise, count });

describe("percentageOf", () => {
  it("rounds to two decimals", () => {
    expect(percentageOf(1, 3)).toBe(33.33);
    expect(percentageOf(2, 3)).toBe(66.67);
  });

  it("returns 100 when the part is the whole", () => {
    expect(percentageOf(500, 500)).toBe(100);
  });

  it("returns 0 when the total is 0, never NaN or Infinity", () => {
    expect(percentageOf(0, 0)).toBe(0);
    expect(percentageOf(10, 0)).toBe(0);
  });

  it("returns 0 for a negative total", () => {
    expect(percentageOf(10, -5)).toBe(0);
  });
});

describe("buildSummary", () => {
  it("is safe for empty data", () => {
    expect(buildSummary([])).toEqual({ totalPaise: 0, byCategory: [] });
  });

  it("gives 0 percent to every category when the total is 0", () => {
    const summary = buildSummary([row(1, "Books", 0), row(2, "Outing", 0)]);
    expect(summary.totalPaise).toBe(0);
    expect(summary.byCategory.map((c) => c.percentage)).toEqual([0, 0]);
  });

  it("sums the total and computes each percentage", () => {
    const summary = buildSummary([
      row(1, "Groceries", 75000, 3),
      row(2, "Books", 25000, 1),
    ]);
    expect(summary.totalPaise).toBe(100000);
    expect(summary.byCategory).toEqual([
      { categoryId: 1, name: "Groceries", totalPaise: 75000, count: 3, percentage: 75 },
      { categoryId: 2, name: "Books", totalPaise: 25000, count: 1, percentage: 25 },
    ]);
  });

  it("orders by total descending regardless of input order", () => {
    const summary = buildSummary([row(1, "Books", 100), row(2, "Outing", 900)]);
    expect(summary.byCategory.map((c) => c.name)).toEqual(["Outing", "Books"]);
  });

  it("breaks ties by name", () => {
    const summary = buildSummary([row(2, "Outing", 100), row(1, "Books", 100)]);
    expect(summary.byCategory.map((c) => c.name)).toEqual(["Books", "Outing"]);
  });

  it("keeps a single category at 100 percent", () => {
    expect(buildSummary([row(1, "Books", 4250)]).byCategory[0].percentage).toBe(
      100,
    );
  });
});
