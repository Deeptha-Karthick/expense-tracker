import {
  errorResponse,
  handleError,
  parseId,
  parseJsonBody,
} from "@/lib/api";
import {
  deleteExpense,
  getExpense,
  updateExpense,
} from "@/lib/repositories/expenses";
import { expenseUpdateSchema } from "@/lib/schemas";

const NOT_FOUND = "Expense not found";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/expenses/[id]">,
) {
  try {
    const id = parseId((await ctx.params).id);
    if (!id.success) return id.response;

    const expense = await getExpense(id.data);
    if (!expense) return errorResponse(NOT_FOUND, 404);
    return Response.json(expense);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/expenses/[id]">,
) {
  try {
    const id = parseId((await ctx.params).id);
    if (!id.success) return id.response;

    const body = await parseJsonBody(request, expenseUpdateSchema);
    if (!body.success) return body.response;

    const expense = await updateExpense(id.data, body.data);
    if (!expense) return errorResponse(NOT_FOUND, 404);
    return Response.json(expense);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/expenses/[id]">,
) {
  try {
    const id = parseId((await ctx.params).id);
    if (!id.success) return id.response;

    const deleted = await deleteExpense(id.data);
    if (!deleted) return errorResponse(NOT_FOUND, 404);
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleError(error);
  }
}
