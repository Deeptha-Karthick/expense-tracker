const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Today's calendar date in Asia/Kolkata as "YYYY-MM-DD" (servers run in UTC). */
export function todayInKolkata(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Adds (or subtracts) whole days to a "YYYY-MM-DD" string, with no timezone involved. */
export function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const utc = Date.UTC(year, month - 1, day) + days * MS_PER_DAY;
  return new Date(utc).toISOString().slice(0, 10);
}
