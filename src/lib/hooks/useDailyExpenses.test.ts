import { renderHook, waitFor } from "@testing-library/react";
import { fetchExpenses } from "@/lib/api-client";
import { useDailyExpenses } from "@/lib/hooks/useDailyExpenses";
import { makeExpense } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchExpenses: vi.fn(),
}));

const mockFetch = vi.mocked(fetchExpenses);

afterEach(() => {
  vi.useRealTimers();
  vi.resetAllMocks();
});

describe("useDailyExpenses", () => {
  it("returns the last 30 days, today included and day 30 excluded", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-30T06:00:00Z")); // 11:30 in Kolkata, still 30 June

    // A fake server that returns only what falls inside the range it was asked for.
    const stored = [
      makeExpense({ id: 1, date: "2026-06-30" }), // today
      makeExpense({ id: 2, date: "2026-06-01" }), // 29 days ago
      makeExpense({ id: 3, date: "2026-05-31" }), // 30 days ago
    ];
    mockFetch.mockImplementation(async (params) => ({
      range: { from: params.from ?? "", to: params.to ?? "" },
      expenses: stored.filter(
        (expense) =>
          (!params.from || expense.date >= params.from) && (!params.to || expense.date <= params.to),
      ),
    }));

    const { result } = renderHook(() => useDailyExpenses());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.today).toBe("2026-06-30");
    expect(result.current.expenses.map((expense) => expense.date)).toEqual([
      "2026-06-30",
      "2026-06-01",
    ]);
  });

  it("uses today's date in Asia/Kolkata even when UTC is still the previous day", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-06-30T20:00:00Z")); // 01:30 on 1 July in Kolkata
    mockFetch.mockImplementation(async (params) => ({
      range: { from: params.from ?? "", to: params.to ?? "" },
      expenses: [makeExpense({ id: 1, date: "2026-07-01" })].filter(
        (expense) => expense.date <= (params.to ?? ""),
      ),
    }));

    const { result } = renderHook(() => useDailyExpenses());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.today).toBe("2026-07-01");
    expect(result.current.expenses).toHaveLength(1);
  });

  it("reports the API error", async () => {
    mockFetch.mockRejectedValue({ response: { data: { error: "Database is down" } } });

    const { result } = renderHook(() => useDailyExpenses());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Database is down");
    expect(result.current.expenses).toEqual([]);
    expect(result.current.today).toBeUndefined();
  });

  it("aborts the pending request on unmount without reporting an error", async () => {
    let signal: AbortSignal | undefined;
    mockFetch.mockImplementation((_params, requestSignal) => {
      signal = requestSignal;
      return new Promise((_resolve, reject) => {
        requestSignal?.addEventListener("abort", () => reject(new Error("canceled")));
      });
    });

    const { result, unmount } = renderHook(() => useDailyExpenses());
    expect(signal?.aborted).toBe(false);
    unmount();

    expect(signal?.aborted).toBe(true);
    await Promise.resolve();
    expect(result.current.error).toBeUndefined();
  });
});
