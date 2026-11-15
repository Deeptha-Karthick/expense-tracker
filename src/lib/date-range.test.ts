import { resolveDateRange } from "@/lib/date-range";

const today = "2026-06-30";
// 90 days before 2026-06-30
const earliest = "2026-04-01";

describe("resolveDateRange", () => {
  it("defaults to the last 30 days ending today", () => {
    expect(resolveDateRange({ today })).toEqual({
      ok: true,
      range: { from: "2026-05-31", to: today },
    });
  });

  it("covers the whole current month with the default window", () => {
    const result = resolveDateRange({ today: "2026-06-30" });
    expect(result.ok && result.range.from <= "2026-06-01").toBe(true);
  });

  it("keeps a valid range as given", () => {
    expect(
      resolveDateRange({ from: "2026-06-01", to: "2026-06-15", today }),
    ).toEqual({ ok: true, range: { from: "2026-06-01", to: "2026-06-15" } });
  });

  it("derives from as 30 days before a given to", () => {
    expect(resolveDateRange({ to: "2026-06-10", today })).toEqual({
      ok: true,
      range: { from: "2026-05-11", to: "2026-06-10" },
    });
  });

  it("defaults to as today when only from is given", () => {
    expect(resolveDateRange({ from: "2026-06-20", today })).toEqual({
      ok: true,
      range: { from: "2026-06-20", to: today },
    });
  });

  it("allows from equal to to", () => {
    expect(
      resolveDateRange({ from: "2026-06-10", to: "2026-06-10", today }),
    ).toEqual({ ok: true, range: { from: "2026-06-10", to: "2026-06-10" } });
  });

  it("clamps a from older than 90 days to the earliest allowed date", () => {
    expect(resolveDateRange({ from: "2025-01-01", today })).toEqual({
      ok: true,
      range: { from: earliest, to: today },
    });
  });

  it("does not clamp a from exactly 90 days back", () => {
    expect(resolveDateRange({ from: earliest, today })).toEqual({
      ok: true,
      range: { from: earliest, to: today },
    });
  });

  it("clamps a from one day older than the limit", () => {
    expect(resolveDateRange({ from: "2026-03-31", today })).toEqual({
      ok: true,
      range: { from: earliest, to: today },
    });
  });

  it("rejects from after to", () => {
    expect(
      resolveDateRange({ from: "2026-06-20", to: "2026-06-10", today }),
    ).toEqual({ ok: false, error: "from must not be after to" });
  });

  it("rejects a range that lies entirely before the 90-day window", () => {
    const result = resolveDateRange({
      from: "2026-01-01",
      to: "2026-02-01",
      today,
    });
    expect(result).toEqual({
      ok: false,
      error: "to must not be more than 90 days ago",
    });
  });

  it("rejects an old to when from is defaulted", () => {
    expect(resolveDateRange({ to: "2026-01-01", today }).ok).toBe(false);
  });

  it("allows a to in the future", () => {
    expect(resolveDateRange({ to: "2026-07-15", today })).toEqual({
      ok: true,
      range: { from: "2026-06-15", to: "2026-07-15" },
    });
  });

  it("works across a year boundary", () => {
    expect(resolveDateRange({ today: "2026-01-10" })).toEqual({
      ok: true,
      range: { from: "2025-12-11", to: "2026-01-10" },
    });
  });
});
