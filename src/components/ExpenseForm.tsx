"use client";

import { useState, type FormEvent } from "react";
import { CategorySelect } from "@/components/CategorySelect";
import { TextField } from "@/components/TextField";
import { getErrorMessage, type CategoryDTO } from "@/lib/api-client";
import {
  validateExpenseForm,
  type ExpenseFormValues,
  type FormErrors,
  type FormField,
} from "@/lib/expense-form";
import type { ExpenseCreateInput } from "@/lib/schemas";

type Props = {
  initialValues: ExpenseFormValues;
  categories: CategoryDTO[];
  submitLabel: string;
  onSubmit: (data: ExpenseCreateInput) => Promise<void>;
  onCancel: () => void;
  onCreateCategory: (name: string) => Promise<CategoryDTO>;
};

export function ExpenseForm({
  initialValues,
  categories,
  submitLabel,
  onSubmit,
  onCancel,
  onCreateCategory,
}: Props) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  function setField(field: FormField) {
    return (value: string) => setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = validateExpenseForm(values);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }

    setErrors({});
    setSubmitError(undefined);
    setSubmitting(true);
    try {
      await onSubmit(result.data);
    } catch (caught) {
      setSubmitError(getErrorMessage(caught, "Could not save the expense."));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <TextField id="expense-date" label="Date" type="date" required value={values.date} onChange={setField("date")} error={errors.date} />
      <TextField id="expense-purpose" label="Purpose" required value={values.purpose} onChange={setField("purpose")} error={errors.purpose} />
      <TextField id="expense-amount" label="Amount (₹)" inputMode="decimal" required value={values.amount} onChange={setField("amount")} error={errors.amount} />
      <CategorySelect
        id="expense-category"
        categories={categories}
        value={values.categoryId}
        onChange={setField("categoryId")}
        onCreate={onCreateCategory}
        error={errors.categoryId}
      />
      <TextField id="expense-merchant" label="Merchant" value={values.merchant} onChange={setField("merchant")} error={errors.merchant} />
      <TextField id="expense-payment" label="Payment method" value={values.paymentMethod} onChange={setField("paymentMethod")} error={errors.paymentMethod} />
      <TextField id="expense-notes" label="Notes" multiline value={values.notes} onChange={setField("notes")} error={errors.notes} />

      {submitError && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {submitError}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium dark:border-white/25"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
