import type { z } from "zod";
import { todayInKolkata } from "@/lib/dates";
import { resolveDateRange, type DateRange } from "@/lib/date-range";
import { idSchema, rangeQuerySchema } from "@/lib/schemas";

export type Parsed<T> =
  | { success: true; data: T }
  | { success: false; response: Response };

/** Every error response has the same shape: { error: string }. */
export function errorResponse(message: string, status: number): Response {
  return Response.json({ error: message }, { status });
}

function describeIssues(error: z.ZodError): string {
  const issue = error.issues[0];
  const path = issue.path.join(".");
  return path ? `${path}: ${issue.message}` : issue.message;
}

function validate<T>(schema: z.ZodType<T>, value: unknown): Parsed<T> {
  const result = schema.safeParse(value);
  if (result.success) return { success: true, data: result.data };
  return {
    success: false,
    response: errorResponse(describeIssues(result.error), 400),
  };
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
): Promise<Parsed<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      success: false,
      response: errorResponse("Request body must be valid JSON", 400),
    };
  }
  return validate(schema, body);
}

export function parseId(raw: string): Parsed<number> {
  const parsed = validate(idSchema, raw);
  if (parsed.success) return parsed;
  return {
    success: false,
    response: errorResponse("id must be a positive integer", 400),
  };
}

/** Validates `from`/`to`, computes "today" in Asia/Kolkata, applies the 90-day clamp. */
export function parseDateRange(
  request: Request,
  now: Date = new Date(),
): Parsed<DateRange> {
  const params = new URL(request.url).searchParams;
  const query = validate(rangeQuerySchema, {
    from: params.get("from") ?? undefined,
    to: params.get("to") ?? undefined,
  });
  if (!query.success) return query;

  const resolved = resolveDateRange({
    ...query.data,
    today: todayInKolkata(now),
  });
  if (!resolved.ok) {
    return { success: false, response: errorResponse(resolved.error, 400) };
  }
  return { success: true, data: resolved.range };
}

/** Postgres SQLSTATE of a database error, looking through driver wrappers. */
export function pgErrorCode(error: unknown): string | undefined {
  let current: unknown = error;
  for (let depth = 0; depth < 3 && current; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/** Maps known database errors to status codes; anything else is a 500. */
export function handleError(error: unknown): Response {
  switch (pgErrorCode(error)) {
    case "23503": // foreign_key_violation
      return errorResponse("Referenced category does not exist", 400);
    case "23505": // unique_violation
      return errorResponse("Resource already exists", 409);
    default:
      console.error(error);
      return errorResponse("Internal server error", 500);
  }
}
