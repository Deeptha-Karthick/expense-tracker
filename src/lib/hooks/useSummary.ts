"use client";

import { useEffect, useState } from "react";
import {
  fetchSummary,
  getErrorMessage,
  type SummaryResponse,
} from "@/lib/api-client";
import { presetRange, type RangePreset } from "@/lib/date-presets";
import { todayInKolkata } from "@/lib/dates";

type Result =
  | { preset: RangePreset; status: "success"; summary: SummaryResponse }
  | { preset: RangePreset; status: "error"; error: string };

export function useSummary(preset: RangePreset) {
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    // "Today" is read here, not during render, so prerendering stays deterministic.
    const range = presetRange(preset, todayInKolkata());

    fetchSummary(range, controller.signal)
      .then((summary) => setResult({ preset, status: "success", summary }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ preset, status: "error", error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, [preset]);

  const current = result?.preset === preset ? result : undefined;
  const status: "loading" | "success" | "error" = current?.status ?? "loading";

  return {
    status,
    summary: current?.status === "success" ? current.summary : undefined,
    error: current?.status === "error" ? current.error : undefined,
  };
}
