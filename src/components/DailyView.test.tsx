import { render, screen, within } from "@testing-library/react";
import { DailyView } from "@/components/DailyView";
import { fetchCategories, fetchExpenses } from "@/lib/api-client";
import { addDays, todayInKolkata } from "@/lib/dates";
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
    expect(within(table).getAllByRole("row")).toHaveLength(32);
    expect(vi.mocked(fetchExpenses).mock.calls[0][0]).toEqual({
      from: addDays(today, -29),
      to: today,
    });
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
    vi.mocked(fetchCategories).mockReturnValue(new Promise(() => {}));
    vi.mocked(fetchExpenses).mockResolvedValue({ range: RANGE, expenses: [] });
    render(<DailyView />);

    await vi.waitFor(() => expect(fetchExpenses).toHaveBeenCalled());
    expect(screen.getByText("Loading daily view…")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
