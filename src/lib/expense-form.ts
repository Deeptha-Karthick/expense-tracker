import type { ExpenseDTO } from "@/lib/api-client";
import { paiseToRupeesInput, rupeesToPaise } from "@/lib/money";
import { expenseCreateSchema, type ExpenseCreateInput } from "@/lib/schemas";

/** Everything is a string while the person is typing; amount is in rupees. */
export type ExpenseFormValues = {
  date: string;
  purpose: string;
  amount: string;
  categoryId: string;
  merchant: string;
  paymentMethod: string;
  notes: string;
};

export type FormField = keyof ExpenseFormValues;
export type FormErrors = Partial<Record<FormField, string>>;

export type ValidationResult =
  | { ok: true; data: ExpenseCreateInput }
  | { ok: false; errors: FormErrors };

// Schema field -> form field.
const FIELD_NAMES: Record<string, FormField> = {
  date: "date",
  purpose: "purpose",
  amountPaise: "amount",
  categoryId: "categoryId",
  merchant: "merchant",
  paymentMethod: "paymentMethod",
  notes: "notes",
};

const MESSAGES: Record<FormField, string> = {
  date: "Enter a valid date",
  purpose: "Enter a purpose (up to 200 characters)",
  amount: "Enter a valid amount, like 150 or 150.50",
  categoryId: "Choose a category",
  merchant: "Merchant is too long (up to 100 characters)",
  paymentMethod: "Payment method is too long (up to 50 characters)",
  notes: "Notes are too long (up to 1000 characters)",
};

export function emptyFormValues(today: string): ExpenseFormValues {
  return {
    date: today,
    purpose: "",
    amount: "",
    categoryId: "",
    merchant: "",
    paymentMethod: "",
    notes: "",
  };
}

export function valuesFromExpense(expense: ExpenseDTO): ExpenseFormValues {
  return {
    date: expense.date,
    purpose: expense.purpose,
    amount: paiseToRupeesInput(expense.amountPaise),
    categoryId: String(expense.categoryId),
    merchant: expense.merchant ?? "",
    paymentMethod: expense.paymentMethod ?? "",
    notes: expense.notes ?? "",
  };
}

/** Only called for an amount the schema rejected: unparseable, zero, or too large. */
function amountMessage(paise: number | null): string {
  if (paise === null) return MESSAGES.amount;
  return paise <= 0 ? "Amount must be greater than 0" : "Amount is too large";
}

/**
 * Converts the form to an API payload (rupees -> integer paise, with no float
 * math) and validates it with the same zod schema the server uses.
 */
export function validateExpenseForm(values: ExpenseFormValues): ValidationResult {
  const paise = rupeesToPaise(values.amount);
  const categoryId = values.categoryId === "" ? undefined : Number(values.categoryId);

  const result = expenseCreateSchema.safeParse({
    date: values.date,
    purpose: values.purpose,
    amountPaise: paise ?? undefined,
    categoryId,
    merchant: values.merchant,
    paymentMethod: values.paymentMethod,
    notes: values.notes,
  });

  if (result.success) return { ok: true, data: result.data };

  const errors: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = FIELD_NAMES[String(issue.path[0])];
    if (field && !errors[field]) {
      errors[field] = field === "amount" ? amountMessage(paise) : MESSAGES[field];
    }
  }
  return { ok: false, errors };
}
