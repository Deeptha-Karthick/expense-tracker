import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseRow } from "@/components/ExpenseRow";
import { makeExpense } from "@/test/fixtures";

function renderRow() {
  const expense = makeExpense();
  const onSelect = vi.fn();
  const onEdit = vi.fn();
  render(
    <ul>
      <ExpenseRow expense={expense} onSelect={onSelect} onEdit={onEdit} />
    </ul>,
  );
  return { expense, onSelect, onEdit };
}

describe("ExpenseRow", () => {
  it("shows the date, purpose, category and formatted amount", () => {
    renderRow();

    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("15 Jun 2026")).toBeInTheDocument();
    expect(screen.getByText("Dine out")).toBeInTheDocument();
    expect(screen.getByText("₹250.50")).toBeInTheDocument();
  });

  it("puts the date in its own column before the purpose", () => {
    renderRow();

    const date = screen.getByText("15 Jun 2026");
    const purpose = screen.getByText("Lunch");

    expect(date.compareDocumentPosition(purpose) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(date).not.toContainElement(purpose);
    expect(purpose).not.toContainElement(date);
  });

  it("puts the category in its own column between the purpose and the amount", () => {
    renderRow();

    const purpose = screen.getByText("Lunch");
    const category = screen.getByText("Dine out");
    const amount = screen.getByText("₹250.50");

    expect(purpose.compareDocumentPosition(category) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(category.compareDocumentPosition(amount) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(purpose).not.toContainElement(category);
  });

  it("is a real button that opens the expense on click", async () => {
    const user = userEvent.setup();
    const { expense, onSelect, onEdit } = renderRow();

    await user.click(screen.getByRole("button", { name: /Lunch/ }));

    expect(onSelect).toHaveBeenCalledWith(expense);
    expect(onEdit).not.toHaveBeenCalled();
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
  ])("opens the expense with the %s key", async (_name, key) => {
    const user = userEvent.setup();
    const { expense, onSelect } = renderRow();

    await user.tab();
    expect(screen.getByRole("button", { name: /Lunch/ })).toHaveFocus();
    await user.keyboard(key);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: expense.id }));
  });

  it("has an edit button that opens the expense for editing, not just viewing", async () => {
    const user = userEvent.setup();
    const { expense, onSelect, onEdit } = renderRow();

    await user.click(screen.getByRole("button", { name: "Edit expense" }));

    expect(onEdit).toHaveBeenCalledWith(expense);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("describes which expense the edit button belongs to", () => {
    renderRow();

    expect(screen.getByRole("button", { name: "Edit expense" })).toHaveAccessibleDescription(
      "Lunch",
    );
  });

  it("makes the edit button reachable by keyboard right after the row", async () => {
    const user = userEvent.setup();
    const { expense, onEdit } = renderRow();

    await user.tab();
    await user.tab();
    expect(screen.getByRole("button", { name: "Edit expense" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(onEdit).toHaveBeenCalledWith(expense);
  });
});
