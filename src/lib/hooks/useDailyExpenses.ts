"use client";

import { useEffect, useState } from "react";
import {
  fetchExpenses,
  getErrorMessage,
  type ExpenseDTO,
} from "@/lib/api-client";
import { DAILY_GRID_DAYS } from "@/lib/daily-grid";
import { addDays, todayInKolkata } from "@/lib/dates";

type Result =
  | { status: "success"; expenses: ExpenseDTO[]; today: string }
  | { status: "error"; error: string };

/** Loads the expenses for the last 30 days (today included) for the daily grid. */
export function useDailyExpenses() {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // "Today" is read here, not during render, so prerendering stays deterministic.
    const today = todayInKolkata();
    const from = addDays(today, -(DAILY_GRID_DAYS - 1));

    fetchExpenses({ from, to: today }, controller.signal)
      .then((data) =>
        setResult({ status: "success", expenses: data.expenses, today }),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ status: "error", error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, []);

  const status: "loading" | "success" | "error" = result?.status ?? "loading";

  return {
    status,
    expenses: result?.status === "success" ? result.expenses : [],
    today: result?.status === "success" ? result.today : undefined,
    error: result?.status === "error" ? result.error : undefined,
  };
}
