import { renderHook, waitFor } from "@testing-library/react";
import { fetchExpenses } from "@/lib/api-client";
import { addDays, todayInKolkata } from "@/lib/dates";
import { useDailyExpenses } from "@/lib/hooks/useDailyExpenses";
import { makeExpense, RANGE } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchExpenses: vi.fn(),
}));

const mockFetch = vi.mocked(fetchExpenses);

afterEach(() => {
  vi.resetAllMocks();
});

describe("useDailyExpenses", () => {
  it("loads exactly the last 30 days, today included", async () => {
    mockFetch.mockResolvedValue({ range: RANGE, expenses: [makeExpense()] });
    const today = todayInKolkata();

    const { result } = renderHook(() => useDailyExpenses());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetch.mock.calls[0][0]).toEqual({ from: addDays(today, -29), to: today });
    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.today).toBe(today);
  });

  it("reports the API error", async () => {
    mockFetch.mockRejectedValue({ response: { data: { error: "Database is down" } } });

    const { result } = renderHook(() => useDailyExpenses());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Database is down");
    expect(result.current.expenses).toEqual([]);
    expect(result.current.today).toBeUndefined();
  });

  it("does not report an error for a request aborted by unmount", async () => {
    mockFetch.mockImplementation((_params, signal) =>
      new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("canceled")));
      }),
    );

    const { result, unmount } = renderHook(() => useDailyExpenses());
    unmount();

    await Promise.resolve();
    expect(result.current.error).toBeUndefined();
  });
});
