"use client";

import { useState } from "react";
import { ExpenseDetail } from "@/components/ExpenseDetail";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Modal } from "@/components/Modal";
import type { CategoryDTO, ExpenseDTO } from "@/lib/api-client";
import { valuesFromExpense } from "@/lib/expense-form";
import type { ExpenseCreateInput } from "@/lib/schemas";

type Props = {
  expense: ExpenseDTO;
  /** Open straight in the edit form (from the row's pencil) instead of the details. */
  startEditing?: boolean;
  categories: CategoryDTO[];
  onUpdate: (data: ExpenseCreateInput) => Promise<void>;
  onDelete: () => Promise<void>;
  onClose: () => void;
  onCreateCategory: (name: string) => Promise<CategoryDTO>;
};

/**
 * One dialog for an existing expense: it starts as the detail view and switches to
 * the edit form in place, so focus stays inside and returns to the row on close.
 */
export function ExpenseDialog({
  expense,
  startEditing = false,
  categories,
  onUpdate,
  onDelete,
  onClose,
  onCreateCategory,
}: Props) {
  const [editing, setEditing] = useState(startEditing);

  return (
    <Modal title={editing ? "Edit expense" : "Expense details"} onClose={onClose}>
      {editing ? (
        <ExpenseForm
          initialValues={valuesFromExpense(expense)}
          categories={categories}
          submitLabel="Save changes"
          onSubmit={onUpdate}
          onCancel={() => setEditing(false)}
          onCreateCategory={onCreateCategory}
        />
      ) : (
        <ExpenseDetail
          expense={expense}
          onEdit={() => setEditing(true)}
          onDelete={onDelete}
        />
      )}
    </Modal>
  );
}
