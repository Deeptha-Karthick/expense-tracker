"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createCategory,
  fetchCategories,
  getErrorMessage,
  type CategoryDTO,
} from "@/lib/api-client";

type Result =
  | { status: "success"; categories: CategoryDTO[] }
  | { status: "error"; error: string };

export function useCategories() {
  const [result, setResult] = useState<Result | null>(null);
  // Categories created in this session, kept apart from the fetched list so a creation
  // is never lost if it finishes before (or without) the initial fetch.
  const [created, setCreated] = useState<CategoryDTO[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetchCategories(controller.signal)
      .then((categories) => setResult({ status: "success", categories }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setResult({ status: "error", error: getErrorMessage(error) });
      });

    return () => controller.abort();
  }, []);

  /** Creates a category and makes it available in the list. Rejects with the API error. */
  const addCategory = useCallback(async (name: string) => {
    const category = await createCategory(name);
    setCreated((current) =>
      current.some((item) => item.id === category.id) ? current : [...current, category],
    );
    return category;
  }, []);

  // Fetched categories first, then ones created here, with no duplicates by id.
  const categories = useMemo(() => {
    const fetched = result?.status === "success" ? result.categories : [];
    const extra = created.filter((item) => !fetched.some((known) => known.id === item.id));
    return [...fetched, ...extra];
  }, [result, created]);

  const status: "loading" | "success" | "error" = result?.status ?? "loading";

  return {
    status,
    categories,
    error: result?.status === "error" ? result.error : undefined,
    addCategory,
  };
}
