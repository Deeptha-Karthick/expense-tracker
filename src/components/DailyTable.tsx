import { DailyCellValue } from "@/components/DailyCellValue";
import type { CategoryDTO } from "@/lib/api-client";
import { categoryColor } from "@/lib/category-colors";
import type { DailyGrid } from "@/lib/daily-grid";
import { formatDisplayDate, formatINR } from "@/lib/format";

type Props = {
  grid: DailyGrid;
  categories: CategoryDTO[];
};

const STICKY_HEAD = "sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium";
const NUMBER_CELL = "px-3 py-2 text-right tabular-nums whitespace-nowrap";

/** Days down, categories across, a total per day at the end and a total per category at the bottom. */
export function DailyTable({ grid, categories }: Props) {
  // Everything shown is prepared here so the markup below only renders it.
  const columns = categories.map((category) => ({
    id: category.id,
    name: category.name,
    color: categoryColor(category.id),
    total: formatINR(grid.columnTotals[category.id] ?? 0),
  }));
  const rows = grid.rows.map((row) => ({
    date: row.date,
    label: formatDisplayDate(row.date),
    total: formatINR(row.totalPaise),
    cells: columns.map((column) => ({ id: column.id, cell: row.cells[column.id] })),
  }));
  const grandTotal = formatINR(grid.grandTotalPaise);

  return (
    <div
      role="region"
      aria-label="Daily expenses by category"
      tabIndex={0}
      className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10"
    >
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Expenses per day for the last 30 days, with a column for each category and a total for each day
        </caption>
        <thead>
          <tr className="border-b border-black/15 dark:border-white/15">
            <th scope="col" className={STICKY_HEAD}>
              Date
            </th>
            {columns.map((column) => (
              <th key={column.id} scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                  {column.name}
                </span>
              </th>
            ))}
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.date} className="border-b border-black/10 dark:border-white/10">
              <th scope="row" className={`${STICKY_HEAD} font-normal whitespace-nowrap`}>
                {row.label}
              </th>
              {row.cells.map(({ id, cell }) => (
                <td key={id} className={NUMBER_CELL}>
                  <DailyCellValue cell={cell} />
                </td>
              ))}
              <td className={`${NUMBER_CELL} font-medium`}>{row.total}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <th scope="row" className={STICKY_HEAD}>
              Total
            </th>
            {columns.map((column) => (
              <td key={column.id} className={NUMBER_CELL}>
                {column.total}
              </td>
            ))}
            <td className={NUMBER_CELL}>{grandTotal}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
