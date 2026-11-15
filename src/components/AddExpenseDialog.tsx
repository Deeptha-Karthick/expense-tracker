"use client";

import { ExpenseForm } from "@/components/ExpenseForm";
import { Modal } from "@/components/Modal";
import type { CategoryDTO } from "@/lib/api-client";
import type { ExpenseFormValues } from "@/lib/expense-form";
import type { ExpenseCreateInput } from "@/lib/schemas";

type Props = {
  initialValues: ExpenseFormValues;
  categories: CategoryDTO[];
  onSubmit: (data: ExpenseCreateInput) => Promise<void>;
  onClose: () => void;
  onCreateCategory: (name: string) => Promise<CategoryDTO>;
};

export function AddExpenseDialog({
  initialValues,
  categories,
  onSubmit,
  onClose,
  onCreateCategory,
}: Props) {
  return (
    <Modal title="Add expense" onClose={onClose}>
      <ExpenseForm
        initialValues={initialValues}
        categories={categories}
        submitLabel="Add expense"
        onSubmit={onSubmit}
        onCancel={onClose}
        onCreateCategory={onCreateCategory}
      />
    </Modal>
  );
}
