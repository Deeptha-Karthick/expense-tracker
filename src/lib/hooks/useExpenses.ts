"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchExpenses,
  getErrorMessage,
  type ExpenseDTO,
} from "@/lib/api-client";
import { MAX_WINDOW_DAYS, type DateRange } from "@/lib/date-range";
import { addDays, todayInKolkata } from "@/lib/dates";

export type ExpensesStatus = "loading" | "success" | "error";

type Mode = "default" | "older";

type Result =
  | { key: string; status: "success"; expenses: ExpenseDTO[]; range: DateRange }
  | { key: string; status: "error"; error: string };

/**
 * Loads expenses. Default view is the server's default window (last 30 days);
 * `loadOlder()` switches to the widest allowed range (90 days) on demand.
 * Previously loaded rows stay visible while a refetch is in flight.
 */
export function useExpenses() {
  const [mode, setMode] = useState<Mode>("default");
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  const key = `${mode}:${version}`;

  useEffect(() => {
    const controller = new AbortController();
    // "Today" is read here, not during render, so prerendering stays deterministic.
    const params =
      mode === "older" ? { from: addDays(todayInKolkata(), -MAX_WINDOW_DAYS) } : {};

    fetchExpenses(params, controller.signal)
      .then((data) =>
        setResult({
          key,
          status: "success",
          expenses: data.expenses,
          range: data.range,
        }),
      )
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ key, status: "error", error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [key, mode]);

  const loadOlder = useCallback(() => setMode("older"), []);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);

  const status: ExpensesStatus = result?.key === key ? result.status : "loading";
  const loaded = result?.status === "success" ? result : undefined;

  return {
    status,
    expenses: loaded?.expenses ?? [],
    range: loaded?.range,
    error: result?.status === "error" ? result.error : undefined,
    loadedOlder: mode === "older",
    loadOlder,
    refresh,
  };
}
