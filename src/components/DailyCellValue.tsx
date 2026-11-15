import type { DailyCell } from "@/lib/daily-grid";
import { formatINR } from "@/lib/format";

type Props = { cell?: DailyCell };

/** One day/category cell: the summed amount (with a count when several), or a dash. */
export function DailyCellValue({ cell }: Props) {
  if (!cell) {
    return (
      <span aria-label="No expenses" className="text-zinc-400 dark:text-zinc-600">
        –
      </span>
    );
  }

  const amount = formatINR(cell.totalPaise);
  const hasSeveral = cell.count > 1;

  return (
    <>
      {amount}
      {hasSeveral && (
        <span className="ml-1 text-xs text-zinc-600 dark:text-zinc-400">×{cell.count}</span>
      )}
    </>
  );
}
