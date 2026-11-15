import { handleError, parseDateRange } from "@/lib/api";
import { totalsByCategory } from "@/lib/repositories/expenses";
import { buildSummary } from "@/lib/summary";

export async function GET(request: Request) {
  try {
    const range = parseDateRange(request);
    if (!range.success) return range.response;

    const totals = await totalsByCategory(range.data.from, range.data.to);
    return Response.json({ range: range.data, ...buildSummary(totals) });
  } catch (error) {
    return handleError(error);
  }
}
