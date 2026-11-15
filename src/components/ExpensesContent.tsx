import { ExpenseList } from "@/components/ExpenseList";
import { StateMessage } from "@/components/StateMessage";
import type { ExpenseDTO } from "@/lib/api-client";
import type { ExpensesStatus } from "@/lib/hooks/useExpenses";

type Props = {
  status: ExpensesStatus;
  expenses: ExpenseDTO[];
  error?: string;
  onRetry: () => void;
  onSelect: (expense: ExpenseDTO) => void;
  onEdit: (expense: ExpenseDTO) => void;
};

/** Chooses between the loading, error, empty and list states. */
export function ExpensesContent({ status, expenses, error, onRetry, onSelect, onEdit }: Props) {
  const hasRows = expenses.length > 0;

  if (hasRows) {
    return <ExpenseList expenses={expenses} onSelect={onSelect} onEdit={onEdit} />;
  }

  if (status === "loading") {
    return <StateMessage title="Loading expenses…" />;
  }

  if (status === "error") {
    return (
      <StateMessage
        role="alert"
        title="Could not load expenses"
        description={error}
        action={
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium hover:bg-black/[.04] dark:border-white/25 dark:hover:bg-white/[.08]"
          >
            Try again
          </button>
        }
      />
    );
  }

  return (
    <StateMessage
      title="No expenses in this range"
      description="Add an expense, or load older ones."
    />
  );
}
