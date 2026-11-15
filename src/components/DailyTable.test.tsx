import { render, screen, within } from "@testing-library/react";
import { DailyTable } from "@/components/DailyTable";
import { buildDailyGrid } from "@/lib/daily-grid";
import { CATEGORIES } from "@/test/fixtures";

const today = "2026-06-30";

function renderTable() {
  const grid = buildDailyGrid({
    categoryIds: CATEGORIES.map((category) => category.id),
    today,
    expenses: [
      { date: "2026-06-15", categoryId: 3, amountPaise: 25050 },
      { date: "2026-06-15", categoryId: 3, amountPaise: 10000 },
      { date: "2026-06-15", categoryId: 1, amountPaise: 90000 },
      { date: "2026-06-20", categoryId: 13, amountPaise: 500 },
    ],
  });
  render(<DailyTable grid={grid} categories={CATEGORIES} />);
}

describe("DailyTable", () => {
  it("is a named, scrollable region containing a table", () => {
    renderTable();

    const region = screen.getByRole("region", { name: "Daily expenses by category" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(within(region).getByRole("table")).toBeInTheDocument();
  });

  it("has a Date column, one column per category in order, and a Total column", () => {
    renderTable();

    const headers = screen.getAllByRole("columnheader").map((header) => header.textContent);
    expect(headers).toEqual(["Date", "Groceries", "Dine out", "Pets", "Total"]);
  });

  it("has one row per day for 30 days, plus the header and totals rows", () => {
    renderTable();

    expect(screen.getAllByRole("row")).toHaveLength(30 + 2);
    expect(screen.getByRole("rowheader", { name: "30 Jun 2026" })).toBeInTheDocument();
    expect(screen.getByRole("rowheader", { name: "1 Jun 2026" })).toBeInTheDocument();
  });

  it("lists days newest first", () => {
    renderTable();

    const dates = screen
      .getAllByRole("rowheader")
      .map((header) => header.textContent)
      .filter((text) => text !== "Total");
    expect(dates[0]).toBe("30 Jun 2026");
    expect(dates[dates.length - 1]).toBe("1 Jun 2026");
  });

  it("puts each expense in its day and category column, with a total for the day at the end", () => {
    renderTable();

    const cells = within(screen.getByRole("row", { name: /15 Jun 2026/ })).getAllByRole("cell");

    expect(cells[0]).toHaveTextContent("₹900.00"); // Groceries
    expect(cells[1]).toHaveTextContent("₹350.50"); // Dine out: 250.50 + 100.00
    expect(cells[1]).toHaveTextContent("×2");
    expect(cells[2]).toHaveAccessibleName("No expenses"); // Pets
    expect(cells[3]).toHaveTextContent("₹1,250.50"); // day total
  });

  it("totals a day that has a single expense", () => {
    renderTable();

    const cells = within(screen.getByRole("row", { name: /20 Jun 2026/ })).getAllByRole("cell");

    expect(cells[2]).toHaveTextContent("₹5.00");
    expect(cells[3]).toHaveTextContent("₹5.00");
  });

  it("shows a zero total for a day with no expenses", () => {
    renderTable();

    const cells = within(screen.getByRole("row", { name: /10 Jun 2026/ })).getAllByRole("cell");

    expect(cells[3]).toHaveTextContent("₹0.00");
  });

  it("ends with a totals row per category and a grand total", () => {
    renderTable();

    const cells = within(screen.getByRole("row", { name: /^Total/ })).getAllByRole("cell");

    expect(cells[0]).toHaveTextContent("₹900.00");
    expect(cells[1]).toHaveTextContent("₹350.50");
    expect(cells[2]).toHaveTextContent("₹5.00");
    expect(cells[3]).toHaveTextContent("₹1,255.50");
  });
});
