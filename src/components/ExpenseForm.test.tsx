import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseForm } from "@/components/ExpenseForm";
import { emptyFormValues, valuesFromExpense } from "@/lib/expense-form";
import { CATEGORIES, makeCategory, makeExpense } from "@/test/fixtures";

function setup(props: Partial<React.ComponentProps<typeof ExpenseForm>> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  const onCreateCategory = vi
    .fn()
    .mockResolvedValue(makeCategory({ id: 99, name: "Gifts", isDefault: false }));
  render(
    <ExpenseForm
      initialValues={emptyFormValues("2026-06-15")}
      categories={CATEGORIES}
      submitLabel="Add expense"
      onSubmit={onSubmit}
      onCancel={onCancel}
      onCreateCategory={onCreateCategory}
      {...props}
    />,
  );
  return { onSubmit, onCancel, onCreateCategory, user: userEvent.setup() };
}

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Purpose/), "Lunch");
  await user.type(screen.getByLabelText(/Amount/), "250.50");
  await user.selectOptions(screen.getByLabelText(/^Category/), "Dine out");
}

const submit = () => screen.getByRole("button", { name: "Add expense" });

describe("ExpenseForm", () => {
  it("has a field for everything an expense stores", () => {
    setup();

    for (const label of [/^Date/, /Purpose/, /Amount/, /^Category/, /Merchant/, /Payment method/, /Notes/]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    expect(screen.getByLabelText(/^Date/)).toHaveValue("2026-06-15");
  });

  it("submits the amount converted from rupees to integer paise", async () => {
    const { user, onSubmit } = setup();

    await fillRequired(user);
    await user.type(screen.getByLabelText(/Merchant/), "Cafe");
    await user.click(submit());

    expect(onSubmit).toHaveBeenCalledWith({
      date: "2026-06-15",
      purpose: "Lunch",
      amountPaise: 25050,
      categoryId: 3,
      merchant: "Cafe",
      paymentMethod: null,
      notes: null,
    });
  });

  it("shows every validation error and does not submit", async () => {
    const { user, onSubmit } = setup();

    await user.click(submit());

    expect(screen.getByLabelText(/Purpose/)).toHaveAccessibleDescription(
      "Enter a purpose (up to 200 characters)",
    );
    expect(screen.getByLabelText(/Amount/)).toHaveAccessibleDescription(
      "Enter a valid amount, like 150 or 150.50",
    );
    expect(screen.getByLabelText(/^Category/)).toHaveAccessibleDescription("Choose a category");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects an amount of zero", async () => {
    const { user, onSubmit } = setup();

    await fillRequired(user);
    await user.clear(screen.getByLabelText(/Amount/));
    await user.type(screen.getByLabelText(/Amount/), "0");
    await user.click(submit());

    expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears old errors once the form is valid", async () => {
    const { user, onSubmit } = setup();

    await user.click(submit());
    await fillRequired(user);
    await user.click(submit());

    expect(screen.getByLabelText(/^Category/)).toBeValid();
    expect(screen.getByLabelText(/Purpose/)).toBeValid();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows the API error and lets the person try again", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce({ response: { data: { error: "Referenced category does not exist" } } })
      .mockResolvedValueOnce(undefined);
    const { user } = setup({ onSubmit });

    await fillRequired(user);
    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Referenced category does not exist",
    );
    expect(submit()).toBeEnabled();

    await user.click(submit());
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it("uses a generic message when the failure has no API message", async () => {
    const { user } = setup({ onSubmit: vi.fn().mockRejectedValue(new Error("network")) });

    await fillRequired(user);
    await user.click(submit());

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not save the expense.");
  });

  it("disables the buttons while saving", async () => {
    const { user } = setup({ onSubmit: vi.fn().mockReturnValue(new Promise(() => {})) });

    await fillRequired(user);
    await user.click(submit());

    expect(submit()).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("cancels", async () => {
    const { user, onCancel } = setup();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("starts with the values of an existing expense, amount in rupees", () => {
    setup({
      initialValues: valuesFromExpense(makeExpense({ amountPaise: 10000050 })),
      submitLabel: "Save changes",
    });

    expect(screen.getByLabelText(/Purpose/)).toHaveValue("Lunch");
    expect(screen.getByLabelText(/Amount/)).toHaveValue("100000.50");
    expect(screen.getByLabelText(/^Category/)).toHaveDisplayValue("Dine out");
    expect(screen.getByLabelText(/Notes/)).toHaveValue("With the team");
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("accepts Indian digit grouping in the amount", async () => {
    const { user, onSubmit } = setup();

    await fillRequired(user);
    await user.clear(screen.getByLabelText(/Amount/));
    await user.type(screen.getByLabelText(/Amount/), "1,00,000");
    await user.click(submit());

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ amountPaise: 10000000 }));
  });

  it("creates a new category inline and submits the expense with it", async () => {
    const { user, onSubmit, onCreateCategory } = setup();

    await user.type(screen.getByLabelText(/Purpose/), "Birthday gift");
    await user.type(screen.getByLabelText(/Amount/), "499");
    await user.selectOptions(screen.getByLabelText(/^Category/), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts");
    await user.click(screen.getByRole("button", { name: "Add category" }));
    await user.click(submit());

    expect(onCreateCategory).toHaveBeenCalledWith("Gifts");
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 99, amountPaise: 49900, purpose: "Birthday gift" }),
    );
  });
});
