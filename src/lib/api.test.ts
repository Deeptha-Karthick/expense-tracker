import { z } from "zod";
import {
  errorResponse,
  handleError,
  parseDateRange,
  parseId,
  parseJsonBody,
  pgErrorCode,
} from "@/lib/api";

const now = new Date("2026-06-30T10:00:00Z");

function jsonRequest(body: string) {
  return new Request("http://localhost/api/x", { method: "POST", body });
}

describe("errorResponse", () => {
  it("uses the { error } shape with the given status", async () => {
    const response = errorResponse("nope", 418);
    expect(response.status).toBe(418);
    expect(await response.json()).toEqual({ error: "nope" });
  });
});

describe("parseJsonBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("returns parsed data for a valid body", async () => {
    const result = await parseJsonBody(jsonRequest('{"name":"a"}'), schema);
    expect(result).toEqual({ success: true, data: { name: "a" } });
  });

  it("returns 400 for invalid JSON", async () => {
    const result = await parseJsonBody(jsonRequest("{oops"), schema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      expect(await result.response.json()).toEqual({
        error: "Request body must be valid JSON",
      });
    }
  });

  it("returns 400 naming the failing field", async () => {
    const result = await parseJsonBody(jsonRequest('{"name":""}'), schema);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toMatch(/^name: /);
    }
  });

  it("describes a root-level error without a path prefix", async () => {
    const result = await parseJsonBody(jsonRequest("5"), schema);
    expect(result.success).toBe(false);
    if (!result.success) {
      const body = await result.response.json();
      expect(body.error).not.toMatch(/^: /);
    }
  });
});

describe("parseId", () => {
  it("parses a valid id", () => {
    expect(parseId("7")).toEqual({ success: true, data: 7 });
  });

  it.each(["abc", "0", "-3", "1.2"])("returns 400 for %j", async (raw) => {
    const result = parseId(raw);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      expect(await result.response.json()).toEqual({
        error: "id must be a positive integer",
      });
    }
  });
});

describe("parseDateRange", () => {
  const request = (query: string) =>
    new Request(`http://localhost/api/expenses${query}`);

  it("defaults to the last 30 days using today in Asia/Kolkata", () => {
    expect(parseDateRange(request(""), now)).toEqual({
      success: true,
      data: { from: "2026-05-31", to: "2026-06-30" },
    });
  });

  it("uses the Kolkata date even when UTC is still the previous day", () => {
    const lateUtc = new Date("2026-06-30T20:00:00Z"); // 01:30 on 1 July in Kolkata
    expect(parseDateRange(request(""), lateUtc)).toEqual({
      success: true,
      data: { from: "2026-06-01", to: "2026-07-01" },
    });
  });

  it("clamps an old from", () => {
    expect(parseDateRange(request("?from=2020-01-01"), now)).toEqual({
      success: true,
      data: { from: "2026-04-01", to: "2026-06-30" },
    });
  });

  it("returns 400 for a malformed date", async () => {
    const result = parseDateRange(request("?from=nope"), now);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      expect((await result.response.json()).error).toMatch(/^from: /);
    }
  });

  it("returns 400 when from is after to", async () => {
    const result = parseDateRange(
      request("?from=2026-06-20&to=2026-06-10"),
      now,
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.response.status).toBe(400);
      expect(await result.response.json()).toEqual({
        error: "from must not be after to",
      });
    }
  });

  it("works with the real clock when no time is given", () => {
    expect(parseDateRange(request("")).success).toBe(true);
  });
});

describe("pgErrorCode", () => {
  it("reads a code on the error itself", () => {
    expect(pgErrorCode({ code: "23505" })).toBe("23505");
  });

  it("looks through wrapped causes", () => {
    expect(pgErrorCode({ cause: { code: "23503" } })).toBe("23503");
  });

  it("ignores non-SQLSTATE codes and non-errors", () => {
    expect(pgErrorCode({ code: "ECONNRESET" })).toBeUndefined();
    expect(pgErrorCode({ code: 23505 })).toBeUndefined();
    expect(pgErrorCode(null)).toBeUndefined();
    expect(pgErrorCode("boom")).toBeUndefined();
  });
});

describe("handleError", () => {
  it("maps a foreign key violation to 400", async () => {
    const response = handleError({ code: "23503" });
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Referenced category does not exist",
    });
  });

  it("maps a unique violation to 409", async () => {
    const response = handleError({ cause: { code: "23505" } });
    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ error: "Resource already exists" });
  });

  it("returns a generic 500 without leaking details", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = handleError(new Error("secret connection string"));
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Internal server error" });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
