import { categoryColor } from "@/lib/category-colors";

describe("categoryColor", () => {
  it("maps ids 1 to 8 onto the eight color slots", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8].map(categoryColor)).toEqual([
      "var(--cat-1)",
      "var(--cat-2)",
      "var(--cat-3)",
      "var(--cat-4)",
      "var(--cat-5)",
      "var(--cat-6)",
      "var(--cat-7)",
      "var(--cat-8)",
    ]);
  });

  it("is stable for a category regardless of other categories", () => {
    expect(categoryColor(3)).toBe(categoryColor(3));
  });

  it("repeats the hues once there are more than eight categories", () => {
    expect(categoryColor(9)).toBe("var(--cat-1)");
    expect(categoryColor(12)).toBe("var(--cat-4)");
  });

  it("stays inside the slots for ids outside the normal range", () => {
    expect(categoryColor(0)).toBe("var(--cat-8)");
    expect(categoryColor(-1)).toBe("var(--cat-7)");
  });
});
