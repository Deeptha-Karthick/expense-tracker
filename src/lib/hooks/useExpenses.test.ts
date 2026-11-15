import { act, renderHook, waitFor } from "@testing-library/react";
import { fetchExpenses } from "@/lib/api-client";
import { addDays, todayInKolkata } from "@/lib/dates";
import { useExpenses } from "@/lib/hooks/useExpenses";
import { makeExpense, RANGE } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchExpenses: vi.fn(),
}));

const mockFetch = vi.mocked(fetchExpenses);

afterEach(() => {
  vi.resetAllMocks();
});

describe("useExpenses", () => {
  it("starts loading, then returns the expenses and the effective range", async () => {
    mockFetch.mockResolvedValue({ range: RANGE, expenses: [makeExpense()] });

    const { result } = renderHook(() => useExpenses());
    expect(result.current.status).toBe("loading");
    expect(result.current.expenses).toEqual([]);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.expenses).toHaveLength(1);
    expect(result.current.range).toEqual(RANGE);
    expect(result.current.loadedOlder).toBe(false);
  });

  it("uses the server's default window for the first load", async () => {
    mockFetch.mockResolvedValue({ range: RANGE, expenses: [] });

    renderHook(() => useExpenses());

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());
    expect(mockFetch.mock.calls[0][0]).toEqual({});
  });

  it("reports the API error message", async () => {
    mockFetch.mockRejectedValue({ response: { data: { error: "Database is down" } } });

    const { result } = renderHook(() => useExpenses());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Database is down");
    expect(result.current.expenses).toEqual([]);
  });

  it("loadOlder requests the widest range and keeps rows visible while loading", async () => {
    mockFetch.mockResolvedValueOnce({ range: RANGE, expenses: [makeExpense()] });
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.status).toBe("success"));

    const olderRange = { from: "2026-04-01", to: "2026-06-30" };
    mockFetch.mockResolvedValueOnce({
      range: olderRange,
      expenses: [makeExpense(), makeExpense({ id: 2 })],
    });
    act(() => result.current.loadOlder());

    expect(result.current.loadedOlder).toBe(true);
    expect(result.current.status).toBe("loading");
    expect(result.current.expenses).toHaveLength(1);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.expenses).toHaveLength(2);
    expect(result.current.range).toEqual(olderRange);
    expect(mockFetch.mock.calls[1][0]).toEqual({
      from: addDays(todayInKolkata(), -90),
    });
  });

  it("refresh fetches again, and retry recovers from an error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useExpenses());
    await waitFor(() => expect(result.current.status).toBe("error"));

    mockFetch.mockResolvedValueOnce({ range: RANGE, expenses: [makeExpense()] });
    act(() => result.current.refresh());

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.expenses).toHaveLength(1);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("ignores a response that arrives after unmount", async () => {
    let resolve: (value: Awaited<ReturnType<typeof fetchExpenses>>) => void = () => {};
    mockFetch.mockReturnValue(new Promise((r) => (resolve = r)));

    const { unmount } = renderHook(() => useExpenses());
    unmount();

    expect(mockFetch.mock.calls[0][1]?.aborted).toBe(true);
    await act(async () => resolve({ range: RANGE, expenses: [] }));
  });

  it("does not report an error for an aborted request", async () => {
    mockFetch.mockImplementation((_params, signal) =>
      new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("canceled")));
      }),
    );

    const { result, unmount } = renderHook(() => useExpenses());
    unmount();

    await Promise.resolve();
    expect(result.current.error).toBeUndefined();
  });
});
