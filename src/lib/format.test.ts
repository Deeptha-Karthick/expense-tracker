import {
  formatDisplayDate,
  formatINR,
  formatPercent,
  formatRangeLabel,
  formatTooltipValue,
} from "@/lib/format";

describe("formatINR", () => {
  it.each([
    [0, "₹0.00"],
    [5, "₹0.05"],
    [1999, "₹19.99"],
    [15050, "₹150.50"],
    [10000050, "₹1,00,000.50"],
    [123456789, "₹12,34,567.89"],
  ])("formats %i paise as %s", (paise, expected) => {
    expect(formatINR(paise)).toBe(expected);
  });
});

describe("formatTooltipValue", () => {
  it("formats untyped chart values as rupees", () => {
    expect(formatTooltipValue(75000)).toBe("₹750.00");
    expect(formatTooltipValue("2500")).toBe("₹25.00");
  });
});

describe("formatDisplayDate", () => {
  it("formats the date exactly as written, with no timezone shift", () => {
    expect(formatDisplayDate("2026-06-15")).toBe("15 Jun 2026");
    expect(formatDisplayDate("2026-03-01")).toBe("1 Mar 2026");
    expect(formatDisplayDate("2026-12-31")).toBe("31 Dec 2026");
  });
});

describe("formatRangeLabel", () => {
  it("joins both ends with an en dash", () => {
    expect(formatRangeLabel({ from: "2026-04-01", to: "2026-06-30" })).toBe(
      "1 Apr 2026 – 30 Jun 2026",
    );
  });
});

describe("formatPercent", () => {
  it.each([
    [0, "0.0%"],
    [33.333, "33.3%"],
    [66.67, "66.7%"],
    [100, "100.0%"],
  ])("formats %d as %s", (value, expected) => {
    expect(formatPercent(value)).toBe(expected);
  });
});
