import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpensesContent } from "@/components/ExpensesContent";
import { makeExpense } from "@/test/fixtures";

const base = { expenses: [], onRetry: vi.fn(), onSelect: vi.fn(), onEdit: vi.fn() };

describe("ExpensesContent", () => {
  it("shows a loading state while there is nothing to show yet", () => {
    render(<ExpensesContent {...base} status="loading" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading expenses…");
  });

  it("shows an empty state when the range has no expenses", () => {
    render(<ExpensesContent {...base} status="success" />);
    expect(screen.getByRole("status")).toHaveTextContent("No expenses in this range");
  });

  it("shows the error and lets the person try again", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ExpensesContent {...base} status="error" error="Database is down" onRetry={onRetry} />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load expenses");
    expect(screen.getByText("Database is down")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the list when there are expenses", () => {
    render(<ExpensesContent {...base} status="success" expenses={[makeExpense()]} />);
    expect(screen.getByRole("list", { name: "Expenses" })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps showing rows while a refetch is loading", () => {
    render(<ExpensesContent {...base} status="loading" expenses={[makeExpense()]} />);
    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.queryByText("Loading expenses…")).not.toBeInTheDocument();
  });
});
