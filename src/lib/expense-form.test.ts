import {
  emptyFormValues,
  valuesFromExpense,
  validateExpenseForm,
  type ExpenseFormValues,
} from "@/lib/expense-form";
import { makeExpense } from "@/test/fixtures";

const valid: ExpenseFormValues = {
  date: "2026-06-15",
  purpose: "Lunch",
  amount: "250.50",
  categoryId: "3",
  merchant: "",
  paymentMethod: "",
  notes: "",
};

function errorsFor(overrides: Partial<ExpenseFormValues>) {
  const result = validateExpenseForm({ ...valid, ...overrides });
  return result.ok ? {} : result.errors;
}

describe("validateExpenseForm", () => {
  it("converts rupees to integer paise and numbers the category", () => {
    const result = validateExpenseForm(valid);
    expect(result).toEqual({
      ok: true,
      data: {
        date: "2026-06-15",
        purpose: "Lunch",
        amountPaise: 25050,
        categoryId: 3,
        merchant: null,
        paymentMethod: null,
        notes: null,
      },
    });
  });

  it.each([
    ["10.5", 1050],
    ["0.1", 10],
    ["19.99", 1999],
    ["1,00,000", 10000000],
  ])("turns the amount %j into %i paise", (amount, paise) => {
    const result = validateExpenseForm({ ...valid, amount });
    expect(result.ok && result.data.amountPaise).toBe(paise);
  });

  it("trims text and keeps optional fields that were filled in", () => {
    const result = validateExpenseForm({
      ...valid,
      purpose: "  Lunch  ",
      merchant: " Cafe ",
      notes: "Team lunch",
    });
    expect(result.ok && result.data).toMatchObject({
      purpose: "Lunch",
      merchant: "Cafe",
      notes: "Team lunch",
    });
  });

  it("reports an empty purpose", () => {
    expect(errorsFor({ purpose: "   " }).purpose).toBe(
      "Enter a purpose (up to 200 characters)",
    );
  });

  it.each([
    ["", "Enter a valid amount, like 150 or 150.50"],
    ["abc", "Enter a valid amount, like 150 or 150.50"],
    ["1.005", "Enter a valid amount, like 150 or 150.50"],
    ["0", "Amount must be greater than 0"],
    ["99999999", "Amount is too large"],
  ])("explains the amount %j", (amount, message) => {
    expect(errorsFor({ amount }).amount).toBe(message);
  });

  it("reports a bad date and a missing category", () => {
    expect(errorsFor({ date: "2026-02-30" }).date).toBe("Enter a valid date");
    expect(errorsFor({ categoryId: "" }).categoryId).toBe("Choose a category");
  });

  it("reports over-long optional fields", () => {
    const errors = errorsFor({
      merchant: "m".repeat(101),
      paymentMethod: "p".repeat(51),
      notes: "n".repeat(1001),
    });
    expect(errors.merchant).toMatch(/too long/);
    expect(errors.paymentMethod).toMatch(/too long/);
    expect(errors.notes).toMatch(/too long/);
  });

  it("reports every invalid field at once", () => {
    const errors = errorsFor({ purpose: "", amount: "", categoryId: "" });
    expect(Object.keys(errors).sort()).toEqual(["amount", "categoryId", "purpose"]);
  });
});

describe("emptyFormValues", () => {
  it("starts on the given date with everything else blank", () => {
    expect(emptyFormValues("2026-06-30")).toEqual({
      date: "2026-06-30",
      purpose: "",
      amount: "",
      categoryId: "",
      merchant: "",
      paymentMethod: "",
      notes: "",
    });
  });
});

describe("valuesFromExpense", () => {
  it("shows paise as rupees and nulls as blanks", () => {
    expect(
      valuesFromExpense(
        makeExpense({ amountPaise: 15050, merchant: null, paymentMethod: null, notes: null }),
      ),
    ).toEqual({
      date: "2026-06-15",
      purpose: "Lunch",
      amount: "150.50",
      categoryId: "3",
      merchant: "",
      paymentMethod: "",
      notes: "",
    });
  });

  it("round-trips into a valid form", () => {
    const result = validateExpenseForm(valuesFromExpense(makeExpense()));
    expect(result.ok && result.data.amountPaise).toBe(25050);
  });
});
