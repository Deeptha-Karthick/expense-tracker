import { categoryColor } from "@/lib/category-colors";
import { formatINR, formatPercent } from "@/lib/format";
import type { Summary } from "@/lib/summary";

type Props = { summary: Summary };

/** The accessible source of truth for the donut: names, amounts and shares as text. */
export function SummaryTable({ summary }: Props) {
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
        {summary.byCategory.map((row) => (
          <tr key={row.categoryId} className="border-b border-black/10 dark:border-white/10">
            <th scope="row" className="py-2 text-left font-normal">
              <span className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-sm"
                  style={{ backgroundColor: categoryColor(row.categoryId) }}
                />
                {row.name}
              </span>
            </th>
            <td className="py-2 text-right tabular-nums">{formatINR(row.totalPaise)}</td>
            <td className="py-2 text-right tabular-nums">{formatPercent(row.percentage)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="font-medium">
          <th scope="row" className="py-2 text-left">Total</th>
          <td className="py-2 text-right tabular-nums">{formatINR(summary.totalPaise)}</td>
          <td className="py-2 text-right tabular-nums">100%</td>
        </tr>
      </tfoot>
    </table>
  );
}
