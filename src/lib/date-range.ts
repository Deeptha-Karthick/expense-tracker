import { addDays } from "@/lib/dates";

/** Default window length when `from` is not given. */
export const DEFAULT_WINDOW_DAYS = 30;
/** How far back a query may reach, measured from today (Asia/Kolkata). */
export const MAX_WINDOW_DAYS = 90;

export type DateRange = { from: string; to: string };

export type RangeResult =
  | { ok: true; range: DateRange }
  | { ok: false; error: string };

/**
 * Resolves the effective range for expense and summary queries.
 *
 * - `to` defaults to `today`; `from` defaults to 30 days before `to`
 *   (so with no params the window starts 30 days ago and covers the current month).
 * - `from` is clamped so it is never more than 90 days before `today`.
 * - Errors: `from` after `to`, or a `to` that is entirely older than the 90-day window.
 *
 * All dates are "YYYY-MM-DD" strings, which compare correctly as plain strings.
 */
export function resolveDateRange(input: {
  from?: string;
  to?: string;
  today: string;
}): RangeResult {
  const { today } = input;
  const to = input.to ?? today;
  const from = input.from ?? addDays(to, -DEFAULT_WINDOW_DAYS);

  if (from > to) {
    return { ok: false, error: "from must not be after to" };
  }

  const earliest = addDays(today, -MAX_WINDOW_DAYS);
  const clampedFrom = from < earliest ? earliest : from;

  if (to < clampedFrom) {
    return {
      ok: false,
      error: `to must not be more than ${MAX_WINDOW_DAYS} days ago`,
    };
  }

  return { ok: true, range: { from: clampedFrom, to } };
}
