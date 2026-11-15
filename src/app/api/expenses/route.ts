import { handleError, parseDateRange, parseJsonBody } from "@/lib/api";
import { createExpense, listExpenses } from "@/lib/repositories/expenses";
import { expenseCreateSchema } from "@/lib/schemas";

export async function GET(request: Request) {
  try {
    const range = parseDateRange(request);
    if (!range.success) return range.response;

    const expenses = await listExpenses(range.data.from, range.data.to);
    return Response.json({ range: range.data, expenses });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, expenseCreateSchema);
    if (!body.success) return body.response;

    const expense = await createExpense(body.data);
    return Response.json(expense, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
