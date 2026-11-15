import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpensesView } from "@/components/ExpensesView";
import {
  createCategory,
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchExpenses,
  updateExpense,
} from "@/lib/api-client";
import { addDays, todayInKolkata } from "@/lib/dates";
import { CATEGORIES, makeCategory, makeExpense, RANGE } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchExpenses: vi.fn(),
  fetchCategories: vi.fn(),
  createExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
  createCategory: vi.fn(),
}));

const lunch = makeExpense();
const taxi = makeExpense({
  id: 2,
  purpose: "Taxi",
  amountPaise: 18000,
  categoryId: 10,
  categoryName: "Transportation cost",
  merchant: null,
  paymentMethod: null,
  notes: null,
});

beforeEach(() => {
  vi.mocked(fetchExpenses).mockResolvedValue({ range: RANGE, expenses: [lunch, taxi] });
  vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);
  vi.mocked(createExpense).mockResolvedValue(undefined);
  vi.mocked(updateExpense).mockResolvedValue(undefined);
  vi.mocked(deleteExpense).mockResolvedValue(undefined);
});

afterEach(() => {
  vi.resetAllMocks();
});

async function renderLoaded() {
  const user = userEvent.setup();
  render(<ExpensesView />);
  await screen.findByRole("button", { name: /Lunch/ });
  return user;
}

describe("ExpensesView list", () => {
  it("shows loading, then rows with date, purpose, category and amount", async () => {
    render(<ExpensesView />);
    expect(screen.getByText("Loading expenses…")).toBeInTheDocument();

    const row = await screen.findByRole("button", { name: /Lunch/ });

    expect(row).toHaveTextContent("15 Jun 2026");
    expect(row).toHaveTextContent("Dine out");
    expect(row).toHaveTextContent("₹250.50");
    expect(screen.getByRole("button", { name: /Taxi/ })).toHaveTextContent("₹180.00");
    expect(screen.getByText("Showing 31 May 2026 – 30 Jun 2026")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    vi.mocked(fetchExpenses).mockResolvedValue({ range: RANGE, expenses: [] });
    render(<ExpensesView />);

    expect(await screen.findByText("No expenses in this range")).toBeInTheDocument();
  });

  it("shows an error and recovers with Try again", async () => {
    const user = userEvent.setup();
    vi.mocked(fetchExpenses).mockRejectedValueOnce({
      response: { data: { error: "Database is down" } },
    });
    render(<ExpensesView />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Database is down");

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByRole("button", { name: /Lunch/ })).toBeInTheDocument();
  });

  it("loads older expenses on demand, then disables the button and shows the range", async () => {
    const user = await renderLoaded();
    const older = makeExpense({ id: 3, purpose: "Old rent", date: "2026-04-05" });
    vi.mocked(fetchExpenses).mockResolvedValue({
      range: { from: "2026-04-01", to: "2026-06-30" },
      expenses: [lunch, taxi, older],
    });
    const button = screen.getByRole("button", { name: "Load older (up to 3 months)" });
    expect(button).toBeEnabled();

    await user.click(button);

    expect(await screen.findByRole("button", { name: /Old rent/ })).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.getByText("Showing 1 Apr 2026 – 30 Jun 2026")).toBeInTheDocument();
    expect(vi.mocked(fetchExpenses).mock.calls[1][0]).toEqual({
      from: addDays(todayInKolkata(), -90),
    });
  });
});

describe("ExpensesView detail modal", () => {
  it("opens all the fields on click", async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole("button", { name: /Lunch/ }));

    const dialog = screen.getByRole("dialog", { name: "Expense details" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    for (const text of ["Lunch", "₹250.50", "15 Jun 2026", "Dine out", "Cafe Coffee Day", "UPI", "With the team"]) {
      expect(within(dialog).getByText(text)).toBeInTheDocument();
    }
  });

  it("opens from the keyboard and returns focus to the row when closed with Escape", async () => {
    const user = await renderLoaded();
    const row = screen.getByRole("button", { name: /Lunch/ });

    await user.tab(); // Add expense
    await user.tab(); // first row
    expect(row).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(row).toHaveFocus();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = await renderLoaded();

    await user.click(screen.getByRole("button", { name: /Lunch/ }));
    await user.click(screen.getByRole("dialog"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("edits an expense and shows the change in the list", async () => {
    const user = await renderLoaded();
    // What the server returns after the update.
    vi.mocked(fetchExpenses).mockResolvedValue({
      range: RANGE,
      expenses: [{ ...lunch, purpose: "Team lunch" }, taxi],
    });

    await user.click(screen.getByRole("button", { name: /Lunch/ }));
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText(/Purpose/));
    await user.type(screen.getByLabelText(/Purpose/), "Team lunch");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("button", { name: /Team lunch/ })).toHaveTextContent("₹250.50");
    expect(screen.queryByText("Lunch")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Taxi/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(updateExpense).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ purpose: "Team lunch", amountPaise: 25050, categoryId: 3 }),
    );
  });

  it("opens straight in edit mode from a row's edit icon and shows the saved change", async () => {
    const user = await renderLoaded();
    vi.mocked(fetchExpenses).mockResolvedValue({
      range: RANGE,
      expenses: [lunch, { ...taxi, purpose: "Cab", amountPaise: 20050 }],
    });

    await user.click(screen.getAllByRole("button", { name: "Edit expense" })[1]);

    const dialog = screen.getByRole("dialog", { name: "Edit expense" });
    expect(within(dialog).getByLabelText(/Purpose/)).toHaveValue("Taxi");
    expect(within(dialog).getByLabelText(/Amount/)).toHaveValue("180");

    await user.clear(within(dialog).getByLabelText(/Purpose/));
    await user.type(within(dialog).getByLabelText(/Purpose/), "Cab");
    await user.clear(within(dialog).getByLabelText(/Amount/));
    await user.type(within(dialog).getByLabelText(/Amount/), "200.50");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("button", { name: /Cab/ })).toHaveTextContent("₹200.50");
    expect(screen.queryByText("Taxi")).not.toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(updateExpense).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ purpose: "Cab", amountPaise: 20050 }),
    );
  });

  it("deletes only after confirmation, then removes the row from the list", async () => {
    const user = await renderLoaded();
    vi.mocked(fetchExpenses).mockResolvedValue({ range: RANGE, expenses: [taxi] });

    await user.click(screen.getByRole("button", { name: /Lunch/ }));
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteExpense).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Lunch/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    await waitFor(() => expect(screen.queryByRole("button", { name: /Lunch/ })).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Taxi/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(deleteExpense).toHaveBeenCalledWith(1);
  });

  it("keeps the dialog open and explains when saving fails", async () => {
    vi.mocked(updateExpense).mockRejectedValue({
      response: { data: { error: "Referenced category does not exist" } },
    });
    const user = await renderLoaded();

    await user.click(screen.getByRole("button", { name: /Lunch/ }));
    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Referenced category does not exist");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("ExpensesView add expense", () => {
  async function openAdd(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Add expense" }));
    return screen.getByRole("dialog", { name: "Add expense" });
  }

  it("adds an expense with the amount converted to paise and shows it in the list", async () => {
    const user = await renderLoaded();
    const created = makeExpense({
      id: 3,
      date: todayInKolkata(),
      purpose: "Groceries run",
      amountPaise: 125075,
      categoryId: 1,
      categoryName: "Groceries",
    });
    vi.mocked(fetchExpenses).mockResolvedValue({ range: RANGE, expenses: [created, lunch, taxi] });
    const dialog = await openAdd(user);

    expect(within(dialog).getByLabelText(/^Date/)).toHaveValue(todayInKolkata());
    await user.type(within(dialog).getByLabelText(/Purpose/), "Groceries run");
    await user.type(within(dialog).getByLabelText(/Amount/), "1,250.75");
    await user.selectOptions(within(dialog).getByLabelText(/^Category/), "Groceries");
    await user.click(within(dialog).getByRole("button", { name: "Add expense" }));

    await waitFor(() => expect(createExpense).toHaveBeenCalledTimes(1));
    expect(createExpense).toHaveBeenCalledWith({
      date: todayInKolkata(),
      purpose: "Groceries run",
      amountPaise: 125075,
      categoryId: 1,
      merchant: null,
      paymentMethod: null,
      notes: null,
    });
    const row = await screen.findByRole("button", { name: /Groceries run/ });
    expect(row).toHaveTextContent("₹1,250.75");
    expect(row).toHaveTextContent("Groceries");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("does not close a newer dialog, or lose its draft, when an older save finishes", async () => {
    let finishSave: () => void = () => {};
    vi.mocked(createExpense).mockReturnValue(
      new Promise<void>((resolve) => {
        finishSave = resolve;
      }),
    );
    const user = await renderLoaded();

    // Start a save that stays pending, then dismiss that dialog.
    const first = await openAdd(user);
    await user.type(within(first).getByLabelText(/Purpose/), "Slow save");
    await user.type(within(first).getByLabelText(/Amount/), "10");
    await user.selectOptions(within(first).getByLabelText(/^Category/), "Groceries");
    await user.click(within(first).getByRole("button", { name: "Add expense" }));
    await user.click(within(first).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    // Open a new dialog and start a draft before the first save finishes.
    const second = await openAdd(user);
    await user.type(within(second).getByLabelText(/Purpose/), "My draft");
    await act(async () => finishSave());

    const stillOpen = screen.getByRole("dialog", { name: "Add expense" });
    expect(within(stillOpen).getByLabelText(/Purpose/)).toHaveValue("My draft");
  });

  it("creates a new category inline and uses it for the expense", async () => {
    vi.mocked(createCategory).mockResolvedValue(
      makeCategory({ id: 14, name: "Gifts", isDefault: false }),
    );
    const user = await renderLoaded();
    const dialog = await openAdd(user);

    await user.type(within(dialog).getByLabelText(/Purpose/), "Birthday gift");
    await user.type(within(dialog).getByLabelText(/Amount/), "499");
    await user.selectOptions(within(dialog).getByLabelText(/^Category/), "+ New category");
    await user.type(within(dialog).getByLabelText("New category name"), "Gifts");
    await user.click(within(dialog).getByRole("button", { name: "Add category" }));

    // The new category is now an option, and selected.
    expect(await within(dialog).findByRole("option", { name: "Gifts" })).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/^Category/)).toHaveDisplayValue("Gifts");

    await user.click(within(dialog).getByRole("button", { name: "Add expense" }));

    await waitFor(() => expect(createExpense).toHaveBeenCalledTimes(1));
    expect(createCategory).toHaveBeenCalledWith("Gifts");
    expect(createExpense).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 14, amountPaise: 49900 }),
    );
  });

  it("returns focus to the Add expense button when cancelled", async () => {
    const user = await renderLoaded();
    const addButton = screen.getByRole("button", { name: "Add expense" });

    await user.click(addButton);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(addButton).toHaveFocus();
    expect(createExpense).not.toHaveBeenCalled();
  });

  it("shows validation errors without calling the API", async () => {
    const user = await renderLoaded();
    const dialog = await openAdd(user);

    await user.click(within(dialog).getByRole("button", { name: "Add expense" }));

    expect(within(dialog).getByLabelText(/Purpose/)).toBeInvalid();
    expect(createExpense).not.toHaveBeenCalled();
  });
});
