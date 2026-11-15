import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { emptyFormValues } from "@/lib/expense-form";
import { CATEGORIES, makeCategory } from "@/test/fixtures";

function setup() {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <AddExpenseDialog
      initialValues={emptyFormValues("2026-06-15")}
      categories={CATEGORIES}
      onSubmit={onSubmit}
      onClose={onClose}
      onCreateCategory={vi.fn().mockResolvedValue(makeCategory())}
    />,
  );
  return { onSubmit, onClose, user: userEvent.setup() };
}

describe("AddExpenseDialog", () => {
  it("is a dialog containing an empty expense form", () => {
    setup();

    const dialog = screen.getByRole("dialog", { name: "Add expense" });
    expect(within(dialog).getByLabelText(/Purpose/)).toHaveValue("");
    expect(within(dialog).getByLabelText(/^Date/)).toHaveValue("2026-06-15");
  });

  it("submits the form's payload", async () => {
    const { user, onSubmit } = setup();

    await user.type(screen.getByLabelText(/Purpose/), "Tea");
    await user.type(screen.getByLabelText(/Amount/), "20");
    await user.selectOptions(screen.getByLabelText(/^Category/), "Groceries");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "Tea", amountPaise: 2000, categoryId: 1 }),
    );
  });

  it("closes from Cancel, the Close button and Escape", async () => {
    const { user, onClose } = setup();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(3);
  });
});
