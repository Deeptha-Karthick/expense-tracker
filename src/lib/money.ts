/**
 * Converts a rupee amount typed by a person into integer paise using string
 * arithmetic only, so floats never get involved ("19.99" * 100 is 1998.99... in JS).
 *
 * Accepts "150", "150.5", "150.50", "1,00,000", "₹ 1,00,000.50". Returns null when the
 * text is not a plain amount with at most two decimals. Zero is returned as 0; callers
 * decide whether it is allowed.
 */
export function rupeesToPaise(input: string): number | null {
  const cleaned = input.replace(/[₹,\s]/g, "");
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;

  const rupees = Number(match[1]);
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
