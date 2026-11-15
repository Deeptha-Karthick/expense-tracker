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
    await createExpense(data);
    closeDialog();
    refresh();
  }

  async function handleUpdate(id: number, data: ExpenseCreateInput) {
    await updateExpense(id, data);
    closeDialog();
    refresh();
  }

  async function handleDelete(id: number) {
    await deleteExpense(id);
    closeDialog();
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
