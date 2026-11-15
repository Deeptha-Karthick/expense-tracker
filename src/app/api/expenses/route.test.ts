import { GET, POST } from "@/app/api/expenses/route";
import { createExpense, listExpenses } from "@/lib/repositories/expenses";

vi.mock("@/lib/repositories/expenses", () => ({
  listExpenses: vi.fn(),
  createExpense: vi.fn(),
}));

const validBody = {
  date: "2026-06-15",
  purpose: "Lunch",
  amountPaise: 25050,
  categoryId: 3,
};

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/expenses", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-06-30T10:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("GET /api/expenses", () => {
  it("returns the effective range and rows for the default window", async () => {
    vi.mocked(listExpenses).mockResolvedValue([]);

    const response = await GET(new Request("http://localhost/api/expenses"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      range: { from: "2026-05-31", to: "2026-06-30" },
      expenses: [],
    });
    expect(listExpenses).toHaveBeenCalledWith("2026-05-31", "2026-06-30");
  });

  it("clamps from to 90 days back and reports the effective range", async () => {
    vi.mocked(listExpenses).mockResolvedValue([]);

    const response = await GET(
      new Request("http://localhost/api/expenses?from=2020-01-01"),
    );

    expect((await response.json()).range).toEqual({
      from: "2026-04-01",
      to: "2026-06-30",
    });
    expect(listExpenses).toHaveBeenCalledWith("2026-04-01", "2026-06-30");
  });

  it("returns 400 for an invalid date without touching the database", async () => {
    const response = await GET(
      new Request("http://localhost/api/expenses?from=abc"),
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(listExpenses).not.toHaveBeenCalled();
  });

  it("returns 400 when from is after to", async () => {
    const response = await GET(
      new Request("http://localhost/api/expenses?from=2026-06-20&to=2026-06-10"),
    );
    expect(response.status).toBe(400);
  });

  it("returns 500 with a generic error when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(listExpenses).mockRejectedValue(new Error("db down"));

    const response = await GET(new Request("http://localhost/api/expenses"));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
  });
});

describe("POST /api/expenses", () => {
  it("creates an expense and returns 201", async () => {
    vi.mocked(createExpense).mockResolvedValue({ id: 1, ...validBody } as never);

    const response = await post(validBody);

    expect(response.status).toBe(201);
    expect((await response.json()).id).toBe(1);
    expect(createExpense).toHaveBeenCalledWith(validBody);
  });

  it.each([
    ["a zero amount", { ...validBody, amountPaise: 0 }],
    ["a fractional amount", { ...validBody, amountPaise: 10.5 }],
    ["a bad date", { ...validBody, date: "2026-02-30" }],
    ["a missing purpose", { ...validBody, purpose: "" }],
    ["an unknown field", { ...validBody, extra: true }],
  ])("returns 400 for %s", async (_label, body) => {
    const response = await post(body);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(createExpense).not.toHaveBeenCalled();
  });

  it("returns 400 for a body that is not JSON", async () => {
    const response = await post("{not json");
    expect(response.status).toBe(400);
  });

  it("returns 400 when the category does not exist", async () => {
    vi.mocked(createExpense).mockRejectedValue({ cause: { code: "23503" } });

    const response = await post(validBody);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Referenced category does not exist",
    });
  });
});
