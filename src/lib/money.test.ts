import { paiseToRupeesInput, rupeesToPaise } from "@/lib/money";

describe("rupeesToPaise", () => {
  it.each([
    ["150", 15000],
    ["10.5", 1050],
    ["10.50", 1050],
    ["0.1", 10],
    ["0.07", 7],
    ["19.99", 1999],
    ["0", 0],
    [" 12 ", 1200],
  ])("converts %j to %i paise", (input, expected) => {
    expect(rupeesToPaise(input)).toBe(expected);
  });

  it("handles Indian digit grouping and the rupee sign", () => {
    expect(rupeesToPaise("1,00,000")).toBe(10000000);
    expect(rupeesToPaise("₹ 1,00,000.50")).toBe(10000050);
  });

  it("avoids float errors: 0.1 + 0.2 is exactly 0.3 in paise", () => {
    // In plain JS floats, 0.1 + 0.2 !== 0.3 and 19.99 * 100 === 1998.9999999999998.
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(19.99 * 100).not.toBe(1999);

    expect(rupeesToPaise("0.1")! + rupeesToPaise("0.2")!).toBe(rupeesToPaise("0.3"));
    expect(rupeesToPaise("19.99")).toBe(1999);
  });

  it("rejects a float-noise value instead of rounding it", () => {
    expect(rupeesToPaise(String(0.1 + 0.2))).toBeNull(); // "0.30000000000000004"
  });

  it.each(["", "abc", "1.005", "1.", ".5", "-5", "1e3", "1.2.3", "12abc", "₹"])(
    "rejects %j",
    (input) => {
      expect(rupeesToPaise(input)).toBeNull();
    },
  );

  it("rejects numbers too large to represent exactly", () => {
    expect(rupeesToPaise("99999999999999999999")).toBeNull();
  });
});

describe("paiseToRupeesInput", () => {
  it.each([
    [15050, "150.50"],
    [15000, "150"],
    [1050, "10.50"],
    [5, "0.05"],
    [0, "0"],
    [10000050, "100000.50"],
  ])("turns %i paise into %j", (paise, expected) => {
    expect(paiseToRupeesInput(paise)).toBe(expected);
  });

  it("round-trips through rupeesToPaise", () => {
    for (const paise of [1, 10, 99, 100, 1999, 15050, 2147483647]) {
      expect(rupeesToPaise(paiseToRupeesInput(paise))).toBe(paise);
    }
  });
});
