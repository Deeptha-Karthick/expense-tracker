import { DEFAULT_WINDOW_DAYS, MAX_WINDOW_DAYS, type DateRange } from "@/lib/date-range";
import { addDays } from "@/lib/dates";

export type RangePreset = "last30" | "thisMonth" | "lastMonth" | "last90";

export const PRESETS: { value: RangePreset; label: string }[] = [
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "last90", label: "90 days" },
];

/** Concrete from/to dates ("YYYY-MM-DD") for a preset, given today in Asia/Kolkata. */
export function presetRange(preset: RangePreset, today: string): DateRange {
  const firstOfMonth = `${today.slice(0, 8)}01`;

  switch (preset) {
    case "last30":
      return { from: addDays(today, -DEFAULT_WINDOW_DAYS), to: today };
    case "last90":
      return { from: addDays(today, -MAX_WINDOW_DAYS), to: today };
    case "thisMonth":
      return { from: firstOfMonth, to: today };
    case "lastMonth": {
      const to = addDays(firstOfMonth, -1);
      return { from: `${to.slice(0, 8)}01`, to };
    }
  }
}
