"use client";

import { useCallback, useEffect, useState } from "react";
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
    const created = await createCategory(name);
    setResult((current) =>
      current?.status === "success"
        ? { status: "success", categories: [...current.categories, created] }
        : current,
    );
    return created;
  }, []);

  const status: "loading" | "success" | "error" = result?.status ?? "loading";

  return {
    status,
    categories: result?.status === "success" ? result.categories : [],
    error: result?.status === "error" ? result.error : undefined,
    addCategory,
  };
}
