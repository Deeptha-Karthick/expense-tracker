import axios from "axios";
import type { DateRange } from "@/lib/date-range";
import type { ExpenseCreateInput } from "@/lib/schemas";
import type { Summary } from "@/lib/summary";

/** JSON shapes returned by the API (dates are strings on the wire). */
export type CategoryDTO = {
  id: number;
  name: string;
  isDefault: boolean;
  createdAt: string;
};

export type ExpenseDTO = {
  id: number;
  date: string;
  purpose: string;
  amountPaise: number;
  categoryId: number;
  categoryName: string;
  merchant: string | null;
  paymentMethod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpensesResponse = { range: DateRange; expenses: ExpenseDTO[] };
export type SummaryResponse = Summary & { range: DateRange };
export type RangeParams = { from?: string; to?: string };

export async function fetchExpenses(
  params: RangeParams,
  signal?: AbortSignal,
): Promise<ExpensesResponse> {
  const response = await axios.get<ExpensesResponse>("/api/expenses", {
    params,
    signal,
  });
  return response.data;
}

export async function createExpense(payload: ExpenseCreateInput): Promise<void> {
  await axios.post("/api/expenses", payload);
}

export async function updateExpense(
  id: number,
  payload: ExpenseCreateInput,
): Promise<void> {
  await axios.patch(`/api/expenses/${id}`, payload);
}

export async function deleteExpense(id: number): Promise<void> {
  await axios.delete(`/api/expenses/${id}`);
}

export async function fetchCategories(
  signal?: AbortSignal,
): Promise<CategoryDTO[]> {
  const response = await axios.get<{ categories: CategoryDTO[] }>(
    "/api/categories",
    { signal },
  );
  return response.data.categories;
}

export async function createCategory(name: string): Promise<CategoryDTO> {
  const response = await axios.post<CategoryDTO>("/api/categories", { name });
  return response.data;
}

export async function fetchSummary(
  params: RangeParams,
  signal?: AbortSignal,
): Promise<SummaryResponse> {
  const response = await axios.get<SummaryResponse>("/api/summary", {
    params,
    signal,
  });
  return response.data;
}

/** Prefers the API's { error } message; falls back to a generic one. */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const message = (error as { response?: { data?: { error?: unknown } } })
    ?.response?.data?.error;
  return typeof message === "string" && message !== "" ? message : fallback;
}
