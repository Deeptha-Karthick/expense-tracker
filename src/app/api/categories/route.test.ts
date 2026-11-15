import { GET, POST } from "@/app/api/categories/route";
import { createCategory, listCategories } from "@/lib/repositories/categories";

vi.mock("@/lib/repositories/categories", () => ({
  listCategories: vi.fn(),
  createCategory: vi.fn(),
}));

const post = (body: unknown) =>
  POST(
    new Request("http://localhost/api/categories", {
      method: "POST",
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

afterEach(() => {
  vi.resetAllMocks();
});

describe("GET /api/categories", () => {
  it("returns the categories in repository order (defaults first)", async () => {
    const rows = [
      { id: 1, name: "Groceries", isDefault: true },
      { id: 13, name: "Pets", isDefault: false },
    ];
    vi.mocked(listCategories).mockResolvedValue(rows as never);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ categories: rows });
  });

  it("returns 500 when the database fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(listCategories).mockRejectedValue(new Error("db down"));

    const response = await GET();

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
  });
});

describe("POST /api/categories", () => {
  it("creates a category with a trimmed name and returns 201", async () => {
    vi.mocked(createCategory).mockResolvedValue({
      id: 13,
      name: "Pets",
      isDefault: false,
    } as never);

    const response = await post({ name: "  Pets  " });

    expect(response.status).toBe(201);
    expect(createCategory).toHaveBeenCalledWith("Pets");
  });

  it("returns 409 for a duplicate name (case-insensitive)", async () => {
    vi.mocked(createCategory).mockResolvedValue(undefined);

    const response = await post({ name: "groceries" });

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Category already exists" });
  });

  it.each([
    ["an empty name", { name: "" }],
    ["a whitespace-only name", { name: "   " }],
    ["a 41-character name", { name: "a".repeat(41) }],
    ["a missing name", {}],
    ["a non-string name", { name: 5 }],
  ])("returns 400 for %s", async (_label, body) => {
    const response = await post(body);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: expect.any(String) });
    expect(createCategory).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON", async () => {
    expect((await post("nope")).status).toBe(400);
  });
});
