import { renderHook, waitFor } from "@testing-library/react";
import { fetchSummary } from "@/lib/api-client";
import { presetRange, type RangePreset } from "@/lib/date-presets";
import { todayInKolkata } from "@/lib/dates";
import { useSummary } from "@/lib/hooks/useSummary";
import { SUMMARY } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchSummary: vi.fn(),
}));

const mockFetch = vi.mocked(fetchSummary);

afterEach(() => {
  vi.resetAllMocks();
});

describe("useSummary", () => {
  it("loads the summary for the preset's date range", async () => {
    mockFetch.mockResolvedValue(SUMMARY);

    const { result } = renderHook(() => useSummary("thisMonth"));
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.summary).toEqual(SUMMARY);
    expect(mockFetch.mock.calls[0][0]).toEqual(
      presetRange("thisMonth", todayInKolkata()),
    );
  });

  it("goes back to loading and refetches when the preset changes", async () => {
    mockFetch.mockResolvedValue(SUMMARY);
    const { result, rerender } = renderHook(
      ({ preset }: { preset: RangePreset }) => useSummary(preset),
      { initialProps: { preset: "last30" as RangePreset } },
    );
    await waitFor(() => expect(result.current.status).toBe("success"));

    rerender({ preset: "lastMonth" });

    expect(result.current.status).toBe("loading");
    expect(result.current.summary).toBeUndefined();
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toEqual(
      presetRange("lastMonth", todayInKolkata()),
    );
  });

  it("reports the API error", async () => {
    mockFetch.mockRejectedValue({ response: { data: { error: "Bad range" } } });

    const { result } = renderHook(() => useSummary("last90"));

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Bad range");
    expect(result.current.summary).toBeUndefined();
  });

  it("does not report an error for a request aborted by unmount", async () => {
    mockFetch.mockImplementation((_params, signal) =>
      new Promise((_resolve, reject) => {
        signal?.addEventListener("abort", () => reject(new Error("canceled")));
      }),
    );

    const { result, unmount } = renderHook(() => useSummary("last30"));
    unmount();

    await Promise.resolve();
    expect(result.current.error).toBeUndefined();
  });
});
