import { act, renderHook, waitFor } from "@testing-library/react";
import { createCategory, fetchCategories } from "@/lib/api-client";
import { useCategories } from "@/lib/hooks/useCategories";
import { CATEGORIES, makeCategory } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchCategories: vi.fn(),
  createCategory: vi.fn(),
}));

afterEach(() => {
  vi.resetAllMocks();
});

describe("useCategories", () => {
  it("loads the categories", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);

    const { result } = renderHook(() => useCategories());
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.categories).toEqual(CATEGORIES);
  });

  it("reports an error", async () => {
    vi.mocked(fetchCategories).mockRejectedValue({
      response: { data: { error: "Nope" } },
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("Nope");
    expect(result.current.categories).toEqual([]);
  });

  it("does not report an error for a request aborted by unmount", async () => {
    vi.mocked(fetchCategories).mockImplementation(
      (signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => reject(new Error("canceled")));
        }),
    );

    const { result, unmount } = renderHook(() => useCategories());
    unmount();

    await Promise.resolve();
    expect(result.current.error).toBeUndefined();
  });

  it("addCategory creates one, appends it and returns it", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);
    const created = makeCategory({ id: 14, name: "Gifts", isDefault: false });
    vi.mocked(createCategory).mockResolvedValue(created);
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.status).toBe("success"));

    let returned: unknown;
    await act(async () => {
      returned = await result.current.addCategory("Gifts");
    });

    expect(returned).toEqual(created);
    expect(createCategory).toHaveBeenCalledWith("Gifts");
    expect(result.current.categories.at(-1)).toEqual(created);
  });

  it("addCategory rejects with the API error and leaves the list unchanged", async () => {
    vi.mocked(fetchCategories).mockResolvedValue(CATEGORIES);
    vi.mocked(createCategory).mockRejectedValue(new Error("duplicate"));
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.status).toBe("success"));

    await expect(result.current.addCategory("Pets")).rejects.toThrow("duplicate");
    expect(result.current.categories).toEqual(CATEGORIES);
  });

  it("addCategory before the list has loaded does not invent a list", async () => {
    vi.mocked(fetchCategories).mockReturnValue(new Promise(() => {}));
    vi.mocked(createCategory).mockResolvedValue(makeCategory({ id: 14 }));
    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.addCategory("Gifts");
    });

    expect(result.current.status).toBe("loading");
    expect(result.current.categories).toEqual([]);
  });
});
