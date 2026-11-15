import { buildDailyGrid } from "@/lib/daily-grid";

const today = "2026-06-30";
const categoryIds = [1, 3, 13];

const expense = (date: string, categoryId: number, amountPaise: number) => ({
  date,
  categoryId,
  amountPaise,
});

const build = (expenses: ReturnType<typeof expense>[], days?: number) =>
  buildDailyGrid({ expenses, categoryIds, today, days });

describe("buildDailyGrid", () => {
  it("has one row per day for 30 days, newest first, ending today", () => {
    const { rows } = build([]);

    expect(rows).toHaveLength(30);
    expect(rows[0].date).toBe("2026-06-30");
    expect(rows[29].date).toBe("2026-06-01");
  });

  it("walks back across a month boundary", () => {
    const { rows } = buildDailyGrid({ expenses: [], categoryIds, today: "2026-03-02", days: 5 });
    expect(rows.map((row) => row.date)).toEqual([
      "2026-03-02",
      "2026-03-01",
      "2026-02-28",
      "2026-02-27",
      "2026-02-26",
    ]);
  });

  it("is all zeros and empty cells when there are no expenses", () => {
    const grid = build([]);

    expect(grid.grandTotalPaise).toBe(0);
    expect(grid.columnTotals).toEqual({});
    expect(grid.rows.every((row) => row.totalPaise === 0)).toBe(true);
    expect(grid.rows.every((row) => Object.keys(row.cells).length === 0)).toBe(true);
  });

  it("puts an expense in its day and category cell", () => {
    const grid = build([expense("2026-06-15", 3, 25050)]);
    const row = grid.rows.find((r) => r.date === "2026-06-15")!;

    expect(row.cells[3]).toEqual({ totalPaise: 25050, count: 1 });
    expect(row.cells[1]).toBeUndefined();
    expect(row.totalPaise).toBe(25050);
    expect(grid.columnTotals).toEqual({ 3: 25050 });
    expect(grid.grandTotalPaise).toBe(25050);
  });

  it("sums several expenses in the same cell and counts them", () => {
    const grid = build([
      expense("2026-06-15", 3, 10000),
      expense("2026-06-15", 3, 5050),
      expense("2026-06-15", 3, 1),
    ]);
    const row = grid.rows.find((r) => r.date === "2026-06-15")!;

    expect(row.cells[3]).toEqual({ totalPaise: 15051, count: 3 });
    expect(row.totalPaise).toBe(15051);
  });

  it("totals a day across categories", () => {
    const grid = build([
      expense("2026-06-15", 1, 30000),
      expense("2026-06-15", 3, 25000),
      expense("2026-06-15", 13, 500),
    ]);

    expect(grid.rows.find((r) => r.date === "2026-06-15")!.totalPaise).toBe(55500);
  });

  it("totals a category across days", () => {
    const grid = build([
      expense("2026-06-15", 1, 30000),
      expense("2026-06-20", 1, 20000),
      expense("2026-06-20", 3, 700),
    ]);

    expect(grid.columnTotals).toEqual({ 1: 50000, 3: 700 });
    expect(grid.grandTotalPaise).toBe(50700);
  });

  it("keeps row totals, column totals and the grand total consistent", () => {
    const grid = build([
      expense("2026-06-01", 1, 111),
      expense("2026-06-10", 3, 222),
      expense("2026-06-10", 13, 333),
      expense("2026-06-30", 1, 444),
    ]);

    const rowSum = grid.rows.reduce((sum, row) => sum + row.totalPaise, 0);
    const columnSum = Object.values(grid.columnTotals).reduce((sum, value) => sum + value, 0);
    expect(rowSum).toBe(1110);
    expect(columnSum).toBe(1110);
    expect(grid.grandTotalPaise).toBe(1110);
  });

  it("includes the first and last day of the window", () => {
    const grid = build([expense("2026-06-01", 1, 100), expense("2026-06-30", 1, 200)]);
    expect(grid.grandTotalPaise).toBe(300);
  });

  it("ignores expenses outside the window", () => {
    const grid = build([
      expense("2026-05-31", 1, 100), // one day before the window
      expense("2026-07-01", 1, 100), // tomorrow
    ]);

    expect(grid.grandTotalPaise).toBe(0);
  });

  it("ignores expenses in a category that has no column", () => {
    const grid = build([expense("2026-06-15", 99, 100), expense("2026-06-15", 1, 50)]);

    expect(grid.grandTotalPaise).toBe(50);
    expect(grid.columnTotals).toEqual({ 1: 50 });
  });

  it("supports a different number of days", () => {
    const grid = build([expense("2026-06-27", 1, 100), expense("2026-06-26", 1, 900)], 4);

    expect(grid.rows).toHaveLength(4);
    expect(grid.grandTotalPaise).toBe(100);
  });
});
