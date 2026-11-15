import { categoryColor } from "@/lib/category-colors";
import { formatINR, formatPercent } from "@/lib/format";
import type { Summary } from "@/lib/summary";

type Props = { summary: Summary };

/** The accessible source of truth for the bar chart: names, amounts and shares as text. */
export function SummaryTable({ summary }: Props) {
  // Everything shown is prepared here so the markup below only renders it.
  const rows = summary.byCategory.map((row) => ({
    id: row.categoryId,
    name: row.name,
    color: categoryColor(row.categoryId),
    amount: formatINR(row.totalPaise),
    share: formatPercent(row.percentage),
  }));
  const total = formatINR(summary.totalPaise);

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">Spending by category</caption>
      <thead>
        <tr className="border-b border-black/15 text-left dark:border-white/15">
          <th scope="col" className="py-2 font-medium">Category</th>
          <th scope="col" className="py-2 text-right font-medium">Amount</th>
          <th scope="col" className="py-2 text-right font-medium">Share</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-black/10 dark:border-white/10">
            <th scope="row" className="py-2 text-left font-normal">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: row.color }}
                />
                {row.name}
              </span>
            </th>
            <td className="py-2 text-right tabular-nums">{row.amount}</td>
            <td className="py-2 text-right tabular-nums">{row.share}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="font-medium">
          <th scope="row" className="py-2 text-left">Total</th>
          <td className="py-2 text-right tabular-nums">{total}</td>
          <td className="py-2 text-right tabular-nums">100%</td>
        </tr>
      </tfoot>
    </table>
  );
}
