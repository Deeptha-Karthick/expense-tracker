import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { CATEGORIES, makeCategory, makeExpense } from "@/test/fixtures";

function setup(startEditing = false) {
  const onUpdate = vi.fn().mockResolvedValue(undefined);
  const onDelete = vi.fn().mockResolvedValue(undefined);
  const onClose = vi.fn();
  render(
    <ExpenseDialog
      expense={makeExpense()}
      startEditing={startEditing}
      categories={CATEGORIES}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onClose={onClose}
      onCreateCategory={vi.fn().mockResolvedValue(makeCategory())}
    />,
  );
  return { onUpdate, onDelete, onClose, user: userEvent.setup() };
}

describe("ExpenseDialog", () => {
  it("opens on the expense details", () => {
    setup();

    expect(screen.getByRole("dialog", { name: "Expense details" })).toBeInTheDocument();
    expect(screen.getByText("Cafe Coffee Day")).toBeInTheDocument();
  });

  it("can open straight in the edit form", () => {
    setup(true);

    expect(screen.getByRole("dialog", { name: "Edit expense" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Purpose/)).toHaveValue("Lunch");
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("switches to an edit form prefilled with the expense", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(screen.getByRole("dialog", { name: "Edit expense" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Purpose/)).toHaveValue("Lunch");
    expect(screen.getByLabelText(/Amount/)).toHaveValue("250.50");
    expect(screen.getByLabelText(/^Category/)).toHaveDisplayValue("Dine out");
  });

  it("saves edits through onUpdate", async () => {
    const { user, onUpdate } = setup();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.clear(screen.getByLabelText(/Purpose/));
    await user.type(screen.getByLabelText(/Purpose/), "Dinner");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ purpose: "Dinner", amountPaise: 25050, categoryId: 3 }),
    );
  });

  it("goes back to the details when editing is cancelled", async () => {
    const { user, onClose } = setup();

    await user.click(screen.getByRole("button", { name: "Edit" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.getByRole("dialog", { name: "Expense details" })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("deletes through onDelete after confirmation", async () => {
    const { user, onDelete } = setup();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("closes with Escape", async () => {
    const { user, onClose } = setup();

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
