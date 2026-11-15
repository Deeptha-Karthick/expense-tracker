import { DELETE, GET, PATCH } from "@/app/api/expenses/[id]/route";
import {
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/lib/repositories/expenses";

vi.mock("@/lib/repositories/expenses", () => ({
  getExpense: vi.fn(),
  updateExpense: vi.fn(),
  deleteExpense: vi.fn(),
}));

const ctx = (id: string) =>
  ({ params: Promise.resolve({ id }) }) as RouteContext<"/api/expenses/[id]">;

const patch = (id: string, body: unknown) =>
  PATCH(
    new Request(`http://localhost/api/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
    ctx(id),
  );

const request = (method: string) =>
  new Request("http://localhost/api/expenses/1", { method });

afterEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/expenses/:id", () => {
  it("returns the expense", async () => {
    vi.mocked(getExpense).mockResolvedValue({ id: 1 } as never);

    const response = await GET(request("GET"), ctx("1"));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ id: 1 });
    expect(getExpense).toHaveBeenCalledWith(1);
  });

  it("returns 404 when missing", async () => {
    vi.mocked(getExpense).mockResolvedValue(undefined);

    const response = await GET(request("GET"), ctx("999"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Expense not found" });
  });

  it("returns 400 for a non-numeric id", async () => {
    const response = await GET(request("GET"), ctx("abc"));

    expect(response.status).toBe(400);
    expect(getExpense).not.toHaveBeenCalled();
  });

  it("returns 500 when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(getExpense).mockRejectedValue(new Error("db down"));

    const response = await GET(request("GET"), ctx("1"));

    expect(response.status).toBe(500);
  });
});

describe("PATCH /api/expenses/:id", () => {
  it("updates and returns the expense", async () => {
    vi.mocked(updateExpense).mockResolvedValue({ id: 1, purpose: "Dinner" } as never);

    const response = await patch("1", { purpose: "Dinner" });

    expect(response.status).toBe(200);
    expect(updateExpense).toHaveBeenCalledWith(1, { purpose: "Dinner" });
  });

  it("returns 404 when missing", async () => {
    vi.mocked(updateExpense).mockResolvedValue(undefined);

    const response = await patch("5", { purpose: "Dinner" });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Expense not found" });
  });

  it("returns 400 for an empty body or invalid field", async () => {
    expect((await patch("1", {})).status).toBe(400);
    expect((await patch("1", { amountPaise: -1 })).status).toBe(400);
    expect(updateExpense).not.toHaveBeenCalled();
  });

  it("returns 400 for a bad id", async () => {
    expect((await patch("0", { purpose: "x" })).status).toBe(400);
  });
});

describe("DELETE /api/expenses/:id", () => {
  it("returns 204 with no body", async () => {
    vi.mocked(deleteExpense).mockResolvedValue(true);

    const response = await DELETE(request("DELETE"), ctx("1"));

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  it("returns 404 when missing", async () => {
    vi.mocked(deleteExpense).mockResolvedValue(false);

    const response = await DELETE(request("DELETE"), ctx("1"));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Expense not found" });
  });

  it("returns 400 for a bad id", async () => {
    const response = await DELETE(request("DELETE"), ctx("-2"));

    expect(response.status).toBe(400);
    expect(deleteExpense).not.toHaveBeenCalled();
  });
});
