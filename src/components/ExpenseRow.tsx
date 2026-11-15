import { useId } from "react";
import { CategoryChip } from "@/components/CategoryChip";
import type { ExpenseDTO } from "@/lib/api-client";
import { formatDisplayDate, formatINR } from "@/lib/format";

type Props = {
  expense: ExpenseDTO;
  onSelect: (expense: ExpenseDTO) => void;
  onEdit: (expense: ExpenseDTO) => void;
};

/**
 * The row is a real <button> (Enter and Space open the details). A second button, the
 * pencil, appears on hover or keyboard focus and opens the expense straight in edit mode.
 */
export function ExpenseRow({ expense, onSelect, onEdit }: Props) {
  const purposeId = useId();
  const date = formatDisplayDate(expense.date);
  const amount = formatINR(expense.amountPaise);

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={() => onSelect(expense)}
        className="grid w-full grid-cols-[5.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 rounded-lg py-3 pl-3 pr-14 text-left hover:bg-black/[.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:grid-cols-[6.5rem_minmax(0,1fr)_11rem_auto] sm:gap-x-4 dark:hover:bg-white/[.06]"
      >
        <time dateTime={expense.date} className="text-sm text-zinc-600 dark:text-zinc-400">
          {date}
        </time>
        <span id={purposeId} className="min-w-0 font-medium">
          {expense.purpose}
        </span>
        <span className="justify-self-start">
          <CategoryChip categoryId={expense.categoryId} name={expense.categoryName} />
        </span>
        <span className="text-right font-medium tabular-nums">{amount}</span>
      </button>
      <button
        type="button"
        aria-label="Edit expense"
        aria-describedby={purposeId}
        onClick={() => onEdit(expense)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 opacity-0 transition-opacity hover:bg-black/[.08] focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-blue-600 group-hover:opacity-100 dark:hover:bg-white/[.12]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
    </li>
  );
}
