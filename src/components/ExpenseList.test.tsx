import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseList } from "@/components/ExpenseList";
import { makeExpense } from "@/test/fixtures";

const expenses = [
  makeExpense({ id: 2, purpose: "Dinner", amountPaise: 90000 }),
  makeExpense({ id: 1, purpose: "Lunch" }),
];

describe("ExpenseList", () => {
  it("renders one row per expense in the given order", () => {
    render(<ExpenseList expenses={expenses} onSelect={vi.fn()} onEdit={vi.fn()} />);

    const items = within(screen.getByRole("list", { name: "Expenses" })).getAllByRole(
      "listitem",
    );
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Dinner");
    expect(items[0]).toHaveTextContent("₹900.00");
    expect(items[1]).toHaveTextContent("Lunch");
  });

  it("reports which expense was selected", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ExpenseList expenses={expenses} onSelect={onSelect} onEdit={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /Lunch/ }));

    expect(onSelect).toHaveBeenCalledWith(expenses[1]);
  });

  it("reports which expense should be edited", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(<ExpenseList expenses={expenses} onSelect={vi.fn()} onEdit={onEdit} />);

    await user.click(screen.getAllByRole("button", { name: "Edit expense" })[1]);

    expect(onEdit).toHaveBeenCalledWith(expenses[1]);
  });
});
