/** Number of validated categorical hues defined as --cat-1..--cat-8 in globals.css. */
export const CATEGORY_COLOR_SLOTS = 8;

/**
 * Stable color per category: derived from the category id, never from rank or
 * position, so a category looks the same in chips, the donut and the table.
 * With more than 8 categories the hues repeat, so color is never the only
 * identifier (names are always shown next to it).
 */
export function categoryColor(categoryId: number): string {
  const slot = (((categoryId - 1) % CATEGORY_COLOR_SLOTS) + CATEGORY_COLOR_SLOTS) % CATEGORY_COLOR_SLOTS;
  return `var(--cat-${slot + 1})`;
}
