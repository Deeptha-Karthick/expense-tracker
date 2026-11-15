import axios from "axios";
import {
  createCategory,
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchExpenses,
  fetchSummary,
  getErrorMessage,
  updateExpense,
} from "@/lib/api-client";

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const payload = {
  date: "2026-06-15",
  purpose: "Lunch",
  amountPaise: 25050,
  categoryId: 3,
};

afterEach(() => {
  vi.resetAllMocks();
});

describe("expense calls", () => {
  it("fetchExpenses sends the range and returns the body", async () => {
    const body = { range: { from: "a", to: "b" }, expenses: [] };
    vi.mocked(axios.get).mockResolvedValue({ data: body });
    const signal = new AbortController().signal;

    const result = await fetchExpenses({ from: "2026-04-01" }, signal);

    expect(result).toBe(body);
    expect(axios.get).toHaveBeenCalledWith("/api/expenses", {
      params: { from: "2026-04-01" },
      signal,
    });
  });

  it("createExpense posts the payload", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: {} });
    await createExpense(payload);
    expect(axios.post).toHaveBeenCalledWith("/api/expenses", payload);
  });

  it("updateExpense patches the expense by id", async () => {
    vi.mocked(axios.patch).mockResolvedValue({ data: {} });
    await updateExpense(7, payload);
    expect(axios.patch).toHaveBeenCalledWith("/api/expenses/7", payload);
  });

  it("deleteExpense deletes by id", async () => {
    vi.mocked(axios.delete).mockResolvedValue({ status: 204 });
    await deleteExpense(7);
    expect(axios.delete).toHaveBeenCalledWith("/api/expenses/7");
  });
});

describe("category calls", () => {
  it("fetchCategories unwraps the categories array", async () => {
    vi.mocked(axios.get).mockResolvedValue({ data: { categories: [{ id: 1 }] } });
    expect(await fetchCategories()).toEqual([{ id: 1 }]);
  });

  it("createCategory posts the name and returns the created category", async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { id: 13, name: "Pets" } });
    expect(await createCategory("Pets")).toEqual({ id: 13, name: "Pets" });
    expect(axios.post).toHaveBeenCalledWith("/api/categories", { name: "Pets" });
  });
});

describe("fetchSummary", () => {
  it("sends the range and returns the body", async () => {
    const body = { range: { from: "a", to: "b" }, totalPaise: 0, byCategory: [] };
    vi.mocked(axios.get).mockResolvedValue({ data: body });

    expect(await fetchSummary({ from: "2026-06-01", to: "2026-06-30" })).toBe(body);
    expect(axios.get).toHaveBeenCalledWith("/api/summary", {
      params: { from: "2026-06-01", to: "2026-06-30" },
      signal: undefined,
    });
  });
});

describe("getErrorMessage", () => {
  it("prefers the API's { error } message", () => {
    expect(getErrorMessage({ response: { data: { error: "Category already exists" } } })).toBe(
      "Category already exists",
    );
  });

  it.each([
    ["an error without a response", new Error("network")],
    ["a blank API message", { response: { data: { error: "" } } }],
    ["a non-string API message", { response: { data: { error: 5 } } }],
    ["null", null],
    ["undefined", undefined],
  ])("falls back for %s", (_label, error) => {
    expect(getErrorMessage(error)).toBe("Something went wrong. Please try again.");
  });

  it("uses a custom fallback", () => {
    expect(getErrorMessage(new Error("x"), "Could not save")).toBe("Could not save");
  });
});
