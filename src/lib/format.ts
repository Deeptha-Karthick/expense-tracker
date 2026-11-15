import type { DateRange } from "@/lib/date-range";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const displayDate = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats integer paise as Indian rupees, e.g. 10000050 -> "₹1,00,000.50". */
export function formatINR(paise: number): string {
  return inr.format(paise / 100);
}

/** Chart tooltip values arrive untyped; they are integer paise. */
export function formatTooltipValue(value: unknown): string {
  return formatINR(Number(value));
}

/** "2026-06-15" -> "15 Jun 2026". The date string is never shifted by a timezone. */
export function formatDisplayDate(date: string): string {
  return displayDate.format(new Date(`${date}T00:00:00Z`));
}

/** 33.333 -> "33.3%". Input is already a percentage (0 to 100). */
export function formatPercent(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

export function formatRangeLabel(range: DateRange): string {
  return `${formatDisplayDate(range.from)} – ${formatDisplayDate(range.to)}`;
}
