# API contract

| Route | Behavior |
| --- | --- |
| `GET /api/expenses?from&to` | Default window starts 30 days ago (always covers the current month). Server-side clamp to 90 days back. Returns the effective range plus rows, newest first, with category name |
| `POST /api/expenses` | Validated body; returns 201 |
| `GET/PATCH/DELETE /api/expenses/:id` | 404 if missing; DELETE returns 204 |
| `GET /api/categories` | Defaults first, then custom |
| `POST /api/categories` | Trim, 1 to 40 chars, 409 on duplicate (case-insensitive) |
| `GET /api/summary?from&to` | `{range, totalPaise, byCategory: [{categoryId, name, totalPaise, percentage, count}]}`; same clamp; safe when the total is 0 |

## Conventions

- **Errors:** always `{ "error": string }` with the right status: 400 invalid input (bad JSON, failed validation, unknown category), 404 missing expense, 409 duplicate category, 500 unexpected (generic message, details only in server logs).
- **Money:** integer paise in JSON as `amountPaise` / `totalPaise`.
- **Dates:** `YYYY-MM-DD` strings. "Today" is computed in Asia/Kolkata.
- **Validation:** zod schemas in `src/lib/schemas.ts`. Request bodies reject unknown fields.

## Details

### Date range (`from`, `to`) for `GET /api/expenses` and `GET /api/summary`
- `to` defaults to today; `from` defaults to 30 days before `to`.
- `from` older than 90 days before today is clamped to today minus 90 days. The response `range` is the effective range.
- 400 if `from` is after `to`, or if the whole range is older than the 90-day window.
- Malformed dates (including impossible ones such as `2026-02-30`) return 400.

### Responses
- `GET /api/expenses`: `{ range: { from, to }, expenses: [...] }`, newest first, each row includes `categoryName`.
- `POST /api/expenses`: body `{ date, purpose, amountPaise, categoryId, merchant?, paymentMethod?, notes? }`; returns 201 with the created expense. `amountPaise` is a positive integer; blank optional text is stored as null.
- `PATCH /api/expenses/:id`: any subset of the POST fields (at least one); `merchant`, `paymentMethod` and `notes` may be `null` to clear them.
- `GET /api/categories`: `{ categories: [...] }`, defaults first, then custom.
- `POST /api/categories`: body `{ name }`; returns 201 with the category.
- `GET /api/summary`: `{ range, totalPaise, byCategory }`, largest category first; categories with no expenses in the range are omitted; `percentage` is rounded to 2 decimals and is 0 when the total is 0.
