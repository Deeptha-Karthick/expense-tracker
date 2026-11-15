import { DEFAULT_CATEGORIES } from "@/lib/default-categories";

describe("DEFAULT_CATEGORIES", () => {
  it("contains the 12 agreed defaults", () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(12);
    expect(DEFAULT_CATEGORIES).toContain("Groceries");
    expect(DEFAULT_CATEGORIES).toContain("Electronic gadgets");
  });

  it("has no duplicates, ignoring case", () => {
    const lowered = DEFAULT_CATEGORIES.map((name) => name.toLowerCase());
    expect(new Set(lowered).size).toBe(lowered.length);
  });

  it("fits the 1 to 40 character category name rule", () => {
    for (const name of DEFAULT_CATEGORIES) {
      expect(name.length).toBeGreaterThanOrEqual(1);
      expect(name.length).toBeLessThanOrEqual(40);
      expect(name).toBe(name.trim());
    }
  });
});
