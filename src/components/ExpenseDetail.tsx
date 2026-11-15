"use client";

import { useState } from "react";
import { CategoryChip } from "@/components/CategoryChip";
import { getErrorMessage, type ExpenseDTO } from "@/lib/api-client";
import { formatDisplayDate, formatINR } from "@/lib/format";

type Props = {
  expense: ExpenseDTO;
  onEdit: () => void;
  onDelete: () => Promise<void>;
};

const EMPTY = "—";

export function ExpenseDetail({ expense, onEdit, onDelete }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string>();

  async function confirmDelete() {
    setDeleting(true);
    setError(undefined);
    try {
      await onDelete();
    } catch (caught) {
      setError(getErrorMessage(caught, "Could not delete the expense."));
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-zinc-600 dark:text-zinc-400">Purpose</dt>
        <dd className="font-medium">{expense.purpose}</dd>
        <dt className="text-zinc-600 dark:text-zinc-400">Amount</dt>
        <dd className="font-medium tabular-nums">{formatINR(expense.amountPaise)}</dd>
        <dt className="text-zinc-600 dark:text-zinc-400">Date</dt>
        <dd>{formatDisplayDate(expense.date)}</dd>
        <dt className="text-zinc-600 dark:text-zinc-400">Category</dt>
        <dd>
          <CategoryChip categoryId={expense.categoryId} name={expense.categoryName} />
        </dd>
        <dt className="text-zinc-600 dark:text-zinc-400">Merchant</dt>
        <dd>{expense.merchant ?? EMPTY}</dd>
        <dt className="text-zinc-600 dark:text-zinc-400">Payment method</dt>
        <dd>{expense.paymentMethod ?? EMPTY}</dd>
        <dt className="text-zinc-600 dark:text-zinc-400">Notes</dt>
        <dd className="whitespace-pre-wrap">{expense.notes ?? EMPTY}</dd>
      </dl>

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {confirming ? (
        <div role="group" aria-label="Confirm delete" className="flex flex-col gap-3">
          <p className="text-sm font-medium">Delete this expense? This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleting}
              className="rounded-md bg-red-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium dark:border-white/25"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-md border border-red-700 px-3 py-1.5 text-sm font-medium text-red-700 dark:border-red-400 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
