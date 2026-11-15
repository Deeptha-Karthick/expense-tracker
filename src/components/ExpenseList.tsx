import { ExpenseRow } from "@/components/ExpenseRow";
import type { ExpenseDTO } from "@/lib/api-client";

type Props = {
  expenses: ExpenseDTO[];
  onSelect: (expense: ExpenseDTO) => void;
  onEdit: (expense: ExpenseDTO) => void;
};

export function ExpenseList({ expenses, onSelect, onEdit }: Props) {
  return (
    <ul aria-label="Expenses" className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
      {expenses.map((expense) => (
        <ExpenseRow key={expense.id} expense={expense} onSelect={onSelect} onEdit={onEdit} />
      ))}
    </ul>
  );
}
