export type CategoryTotal = {
  categoryId: number;
  name: string;
  totalPaise: number;
  count: number;
};

export type CategorySummary = CategoryTotal & { percentage: number };

export type Summary = {
  totalPaise: number;
  byCategory: CategorySummary[];
};

/** Share of `part` in `total` as a percentage rounded to 2 decimals; 0 when total is 0. */
export function percentageOf(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 10000) / 100;
}

/**
 * Builds the summary payload from per-category totals. Largest category first
 * (ties by name). Safe for empty input and a total of 0 (percentages are 0).
 */
export function buildSummary(totals: CategoryTotal[]): Summary {
  const totalPaise = totals.reduce((sum, row) => sum + row.totalPaise, 0);

  const byCategory = totals
    .map((row) => ({
      ...row,
      percentage: percentageOf(row.totalPaise, totalPaise),
    }))
    .sort((a, b) => b.totalPaise - a.totalPaise || a.name.localeCompare(b.name));

  return { totalPaise, byCategory };
}
