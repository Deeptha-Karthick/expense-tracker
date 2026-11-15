import { addDays, isValidDateString, todayInKolkata } from "@/lib/dates";

describe("isValidDateString", () => {
  it("accepts real dates including leap days", () => {
    expect(isValidDateString("2026-06-15")).toBe(true);
    expect(isValidDateString("2028-02-29")).toBe(true);
  });

  it.each(["2026-02-30", "2027-02-29", "2026-13-01", "2026-00-10", "2026-6-5", "", "yesterday", "2026-06-15T00:00:00Z"])(
    "rejects %j",
    (value) => {
      expect(isValidDateString(value)).toBe(false);
    },
  );
});

describe("todayInKolkata", () => {
  it("rolls to the next day once UTC passes 18:30", () => {
    expect(todayInKolkata(new Date("2026-03-10T18:29:00Z"))).toBe("2026-03-10");
    expect(todayInKolkata(new Date("2026-03-10T18:30:00Z"))).toBe("2026-03-11");
  });

  it("defaults to the current time in YYYY-MM-DD format", () => {
    expect(todayInKolkata()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("addDays", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("subtracts days", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("handles leap years", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("returns the same date for zero", () => {
    expect(addDays("2026-05-15", 0)).toBe("2026-05-15");
  });
});
