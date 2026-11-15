import { PRESETS, presetRange } from "@/lib/date-presets";

describe("presetRange", () => {
  const today = "2026-06-30";

  it("last30 matches the API default window", () => {
    expect(presetRange("last30", today)).toEqual({ from: "2026-05-31", to: today });
  });

  it("last90 reaches exactly the API clamp limit", () => {
    expect(presetRange("last90", today)).toEqual({ from: "2026-04-01", to: today });
  });

  it("thisMonth runs from the 1st to today", () => {
    expect(presetRange("thisMonth", today)).toEqual({ from: "2026-06-01", to: today });
    expect(presetRange("thisMonth", "2026-06-01")).toEqual({
      from: "2026-06-01",
      to: "2026-06-01",
    });
  });

  it("lastMonth covers the whole previous month", () => {
    expect(presetRange("lastMonth", today)).toEqual({
      from: "2026-05-01",
      to: "2026-05-31",
    });
  });

  it("lastMonth rolls back across a year boundary", () => {
    expect(presetRange("lastMonth", "2026-01-15")).toEqual({
      from: "2025-12-01",
      to: "2025-12-31",
    });
  });

  it("lastMonth handles February in a leap year", () => {
    expect(presetRange("lastMonth", "2028-03-10")).toEqual({
      from: "2028-02-01",
      to: "2028-02-29",
    });
  });
});

describe("PRESETS", () => {
  it("offers the four toggle options in order", () => {
    expect(PRESETS.map((preset) => preset.label)).toEqual([
      "Last 30 days",
      "This month",
      "Last month",
      "90 days",
    ]);
  });
});
