import { GET } from "@/app/api/summary/route";
import { totalsByCategory } from "@/lib/repositories/expenses";

vi.mock("@/lib/repositories/expenses", () => ({
  totalsByCategory: vi.fn(),
}));

const get = (query = "") =>
  GET(new Request(`http://localhost/api/summary${query}`));

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-06-30T10:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("GET /api/summary", () => {
  it("returns totals, counts and percentages per category", async () => {
    vi.mocked(totalsByCategory).mockResolvedValue([
      { categoryId: 2, name: "Books", totalPaise: 25000, count: 1 },
      { categoryId: 1, name: "Groceries", totalPaise: 75000, count: 3 },
    ]);

    const response = await get();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      range: { from: "2026-05-31", to: "2026-06-30" },
      totalPaise: 100000,
      byCategory: [
        { categoryId: 1, name: "Groceries", totalPaise: 75000, count: 3, percentage: 75 },
        { categoryId: 2, name: "Books", totalPaise: 25000, count: 1, percentage: 25 },
      ],
    });
  });

  it("is safe when there is no data", async () => {
    vi.mocked(totalsByCategory).mockResolvedValue([]);

    const response = await get();

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ totalPaise: 0, byCategory: [] });
  });

  it("applies the same 90-day clamp as expenses", async () => {
    vi.mocked(totalsByCategory).mockResolvedValue([]);

    const response = await get("?from=2020-01-01");

    expect((await response.json()).range.from).toBe("2026-04-01");
    expect(totalsByCategory).toHaveBeenCalledWith("2026-04-01", "2026-06-30");
  });

  it("returns 400 for invalid or reversed dates", async () => {
    expect((await get("?to=nope")).status).toBe(400);
    expect((await get("?from=2026-06-20&to=2026-06-10")).status).toBe(400);
    expect(totalsByCategory).not.toHaveBeenCalled();
  });

  it("returns 500 when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(totalsByCategory).mockRejectedValue(new Error("db down"));

    const response = await get();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
  });
});
