import { act, render, screen, within } from "@testing-library/react";
import { DailyView } from "@/components/DailyView";
import { fetchCategories, fetchExpenses } from "@/lib/api-client";
import { addDays, todayInKolkata } from "@/lib/dates";
import { formatDisplayDate } from "@/lib/format";
import { CATEGORIES, makeExpense, RANGE } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchExpenses: vi.fn(),
  fetchCategories: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe("DailyView", () => {
  it("shows loading, then a grid of the last 30 days by category", async () => {
    const today = todayInKolkata();
    vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(fetchExpenses).mockResolvedValue({
      range: RANGE,
      expenses: [makeExpense({ date: today, categoryId: 3, amountPaise: 25050 })],
    });
    render(<DailyView />);

    expect(screen.getByText("Loading daily view…")).toBeInTheDocument();

    const table = await screen.findByRole("table");
    expect(screen.getByRole("heading", { name: "Daily" })).toBeInTheDocument();
    expect(within(table).getAllByRole("columnheader").map((h) => h.textContent)).toEqual([
      "Date",
      "Groceries",
      "Dine out",
      "Pets",
      "Total",
    ]);

    // 30 days: today first, 29 days ago last (the bottom row is the totals row).
    const days = within(table)
      .getAllByRole("rowheader")
      .map((header) => header.textContent)
      .filter((text) => text !== "Total");
    expect(days).toHaveLength(30);
    expect(days[0]).toBe(formatDisplayDate(today));
    expect(days[29]).toBe(formatDisplayDate(addDays(today, -29)));
  });

  it("puts today's expense in today's row and totals it", async () => {
    const today = todayInKolkata();
    vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(fetchExpenses).mockResolvedValue({
      range: RANGE,
      expenses: [
        makeExpense({ id: 1, date: today, categoryId: 3, amountPaise: 25050 }),
        makeExpense({ id: 2, date: today, categoryId: 1, amountPaise: 10000 }),
      ],
    });
    render(<DailyView />);

    const cells = within((await screen.findAllByRole("row"))[1]).getAllByRole("cell");

    expect(cells[0]).toHaveTextContent("₹100.00");
    expect(cells[1]).toHaveTextContent("₹250.50");
    expect(cells[3]).toHaveTextContent("₹350.50");
  });

  it("shows an error when the expenses fail to load", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(fetchExpenses).mockRejectedValue({ response: { data: { error: "Database is down" } } });
    render(<DailyView />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the daily view");
    expect(screen.getByText("Database is down")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an error when the categories fail to load", async () => {
    vi.mocked(fetchCategories).mockRejectedValue({ response: { data: { error: "No categories" } } });
    vi.mocked(fetchExpenses).mockResolvedValue({ range: RANGE, expenses: [] });
    render(<DailyView />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No categories");
  });

  it("keeps loading until both the expenses and the categories have arrived", async () => {
    let resolveExpenses: (value: { range: typeof RANGE; expenses: [] }) => void = () => {};
    vi.mocked(fetchCategories).mockReturnValue(new Promise(() => {})); // never arrives
    vi.mocked(fetchExpenses).mockReturnValue(new Promise((resolve) => (resolveExpenses = resolve)));
    render(<DailyView />);

    // The expenses have arrived; the categories have not.
    await act(async () => resolveExpenses({ range: RANGE, expenses: [] }));

    expect(screen.getByText("Loading daily view…")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
