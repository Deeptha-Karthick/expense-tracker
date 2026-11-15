import { errorResponse, handleError, parseJsonBody } from "@/lib/api";
import { createCategory, listCategories } from "@/lib/repositories/categories";
import { categoryCreateSchema } from "@/lib/schemas";

export async function GET() {
  try {
    return Response.json({ categories: await listCategories() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await parseJsonBody(request, categoryCreateSchema);
    if (!body.success) return body.response;

    const category = await createCategory(body.data.name);
    if (!category) return errorResponse("Category already exists", 409);
    return Response.json(category, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
