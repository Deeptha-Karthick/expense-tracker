"use client";

import { useEffect, useRef, useState } from "react";
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
 * When the view switches, focus moves to the first form field, or back to Edit.
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
  const contentRef = useRef<HTMLDivElement>(null);
  const shownEditing = useRef(editing);

  const title = editing ? "Edit expense" : "Expense details";
  const initialValues = valuesFromExpense(expense);

  useEffect(() => {
    // Only react to a switch between views, not to the first render (Modal handles that).
    if (shownEditing.current === editing) return;
    shownEditing.current = editing;

    const selector = editing ? "input, select, textarea" : "[data-initial-focus]";
    contentRef.current?.querySelector<HTMLElement>(selector)?.focus();
  }, [editing]);

  return (
    <Modal title={title} onClose={onClose}>
      <div ref={contentRef}>
        {editing ? (
          <ExpenseForm
            initialValues={initialValues}
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
      </div>
    </Modal>
  );
}
