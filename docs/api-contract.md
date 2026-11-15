# API contract

| Route | Behavior |
| --- | --- |
| `GET /api/expenses?from&to` | Default window starts 30 days ago (always covers the current month). Server-side clamp to 90 days back. Returns the effective range plus rows, newest first, with category name |
| `POST /api/expenses` | Validated body; returns 201 |
| `GET/PATCH/DELETE /api/expenses/:id` | 404 if missing; DELETE returns 204 |
| `GET /api/categories` | Defaults first, then custom |
| `POST /api/categories` | Trim, 1 to 40 chars, 409 on duplicate (case-insensitive) |
| `GET /api/summary?from&to` | `{range, totalPaise, byCategory: [{categoryId, name, totalPaise, percentage, count}]}`; same clamp; safe when the total is 0 |
