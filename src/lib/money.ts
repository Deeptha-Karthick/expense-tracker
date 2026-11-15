// One optional leading rupee sign, then digits that are either ungrouped, Indian-grouped
// (12,34,567) or Western-grouped (1,234,567), then at most two decimals. The whole text
// must match, so stray signs, spaces or commas anywhere else are rejected.
const AMOUNT =
  /^(?:₹\s*)?(\d{1,2}(?:,\d{2})*,\d{3}|\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{1,2}))?$/;

/**
 * Converts a rupee amount typed by a person into integer paise using string
 * arithmetic only, so floats never get involved ("19.99" * 100 is 1998.99... in JS).
 *
 * Accepts "150", "150.5", "150.50", "1,00,000", "1,000,000", "₹ 1,00,000.50". Returns
 * null for anything else, such as "₹100 ₹200", "1,0,0", "1.005" or "abc". Zero is
 * returned as 0; callers decide whether it is allowed.
 */
export function rupeesToPaise(input: string): number | null {
  const match = AMOUNT.exec(input.trim());
  if (!match) return null;

  const rupees = Number(match[1].replace(/,/g, ""));
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  const paise = rupees * 100 + fraction;

  return Number.isSafeInteger(paise) ? paise : null;
}

/** Integer paise -> plain editable rupee text: 15050 -> "150.50", 15000 -> "150". */
export function paiseToRupeesInput(paise: number): string {
  const rupees = Math.floor(paise / 100);
  const fraction = paise % 100;
  if (fraction === 0) return String(rupees);
  return `${rupees}.${String(fraction).padStart(2, "0")}`;
}
