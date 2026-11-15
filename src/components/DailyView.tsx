"use client";

import { DailyTable } from "@/components/DailyTable";
import { StateMessage } from "@/components/StateMessage";
import { buildDailyGrid } from "@/lib/daily-grid";
import { useCategories } from "@/lib/hooks/useCategories";
import { useDailyExpenses } from "@/lib/hooks/useDailyExpenses";

export function DailyView() {
  const daily = useDailyExpenses();
  const categories = useCategories();

  const error = daily.error ?? categories.error;
  const loading = daily.status === "loading" || categories.status === "loading";

  let content;
  if (error) {
    content = <StateMessage role="alert" title="Could not load the daily view" description={error} />;
  } else if (loading || !daily.today) {
    content = <StateMessage title="Loading daily view…" />;
  } else {
    const grid = buildDailyGrid({
      expenses: daily.expenses,
      categoryIds: categories.categories.map((category) => category.id),
      today: daily.today,
    });
    content = <DailyTable grid={grid} categories={categories.categories} />;
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-2xl font-semibold">Daily</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Last 30 days, one row per day and one column per category.
      </p>
      {content}
    </div>
  );
}
