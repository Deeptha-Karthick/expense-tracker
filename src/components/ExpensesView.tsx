"use client";

import { useState } from "react";
import { AddExpenseDialog } from "@/components/AddExpenseDialog";
import { ExpenseDialog } from "@/components/ExpenseDialog";
import { ExpensesContent } from "@/components/ExpensesContent";
import { LoadOlder } from "@/components/LoadOlder";
import {
  createExpense,
  deleteExpense,
  updateExpense,
  type ExpenseDTO,
} from "@/lib/api-client";
import { todayInKolkata } from "@/lib/dates";
import { emptyFormValues, type ExpenseFormValues } from "@/lib/expense-form";
import { useCategories } from "@/lib/hooks/useCategories";
import { useExpenses } from "@/lib/hooks/useExpenses";
import type { ExpenseCreateInput } from "@/lib/schemas";

type OpenDialog =
  | { kind: "add"; values: ExpenseFormValues }
  | { kind: "expense"; expense: ExpenseDTO; editing: boolean }
  | null;

export function ExpensesView() {
  const { status, expenses, range, error, loadedOlder, loadOlder, refresh } = useExpenses();
  const { categories, addCategory } = useCategories();
  const [dialog, setDialog] = useState<OpenDialog>(null);

  const closeDialog = () => setDialog(null);

  /** Closes `opened` only if it is still the open dialog, so a newer dialog and its draft survive. */
  function closeIfCurrent(opened: OpenDialog) {
    setDialog((current) => (current === opened ? null : current));
  }

  function openAdd() {
    setDialog({ kind: "add", values: emptyFormValues(todayInKolkata()) });
  }

  function openDetails(expense: ExpenseDTO) {
    setDialog({ kind: "expense", expense, editing: false });
  }

  function openEdit(expense: ExpenseDTO) {
    setDialog({ kind: "expense", expense, editing: true });
  }

  async function handleCreate(data: ExpenseCreateInput) {
    const opened = dialog;
    await createExpense(data);
    closeIfCurrent(opened);
    refresh();
  }

  async function handleUpdate(id: number, data: ExpenseCreateInput) {
    const opened = dialog;
    await updateExpense(id, data);
    closeIfCurrent(opened);
    refresh();
  }

  async function handleDelete(id: number) {
    const opened = dialog;
    await deleteExpense(id);
    closeIfCurrent(opened);
    refresh();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Add expense
        </button>
      </div>

      <ExpensesContent
        status={status}
        expenses={expenses}
        error={error}
        onRetry={refresh}
        onSelect={openDetails}
        onEdit={openEdit}
      />

      <LoadOlder
        loaded={loadedOlder}
        loading={status === "loading"}
        range={range}
        onLoad={loadOlder}
      />

      {dialog?.kind === "add" && (
        <AddExpenseDialog
          initialValues={dialog.values}
          categories={categories}
          onSubmit={handleCreate}
          onClose={closeDialog}
          onCreateCategory={addCategory}
        />
      )}

      {dialog?.kind === "expense" && (
        <ExpenseDialog
          expense={dialog.expense}
          startEditing={dialog.editing}
          categories={categories}
          onUpdate={(data) => handleUpdate(dialog.expense.id, data)}
          onDelete={() => handleDelete(dialog.expense.id)}
          onClose={closeDialog}
          onCreateCategory={addCategory}
        />
      )}
    </div>
  );
}
