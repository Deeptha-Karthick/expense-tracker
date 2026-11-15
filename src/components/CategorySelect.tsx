"use client";

import { useState, type KeyboardEvent } from "react";
import { getErrorMessage, type CategoryDTO } from "@/lib/api-client";
import { categoryCreateSchema } from "@/lib/schemas";

type Props = {
  id: string;
  categories: CategoryDTO[];
  value: string;
  onChange: (value: string) => void;
  onCreate: (name: string) => Promise<CategoryDTO>;
  error?: string;
};

const NEW_CATEGORY = "__new__";
const CONTROL_CLASS =
  "w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm aria-[invalid=true]:border-red-700 dark:border-white/25 dark:aria-[invalid=true]:border-red-400";

/** Category dropdown with a "+ New category" option that creates and selects one inline. */
export function CategorySelect({ id, categories, value, onChange, onCreate, error }: Props) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState<string>();

  const selectValue = creating ? NEW_CATEGORY : value;
  const errorId = `${id}-error`;

  function handleSelect(next: string) {
    if (next === NEW_CATEGORY) {
      setCreating(true);
      return;
    }
    setCreating(false);
    onChange(next);
  }

  function cancelCreate() {
    setCreating(false);
    setName("");
    setCreateError(undefined);
  }

  async function addCategory() {
    const parsed = categoryCreateSchema.safeParse({ name });
    if (!parsed.success) {
      setCreateError("Enter a name (1 to 40 characters)");
      return;
    }

    setSaving(true);
    setCreateError(undefined);
    try {
      const created = await onCreate(parsed.data.name);
      onChange(String(created.id));
      cancelCreate();
    } catch (caught) {
      setCreateError(getErrorMessage(caught, "Could not create the category."));
    } finally {
      setSaving(false);
    }
  }

  function handleNameKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // Enter here adds the category instead of submitting the whole expense form.
    if (event.key !== "Enter") return;
    event.preventDefault();
    void addCategory();
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        Category <span aria-hidden="true">*</span>
      </label>
      <select
        id={id}
        value={selectValue}
        onChange={(event) => handleSelect(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        aria-required="true"
        className={CONTROL_CLASS}
      >
        <option value="">Choose a category</option>
        {categories.map((category) => (
          <option key={category.id} value={String(category.id)}>
            {category.name}
          </option>
        ))}
        <option value={NEW_CATEGORY}>+ New category</option>
      </select>
      {error && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {creating && (
        <div className="mt-2 flex flex-col gap-2 rounded-md border border-black/15 p-3 dark:border-white/15">
          <label htmlFor={`${id}-new`} className="text-sm font-medium">
            New category name
          </label>
          <input
            id={`${id}-new`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={handleNameKeyDown}
            maxLength={40}
            className={CONTROL_CLASS}
          />
          {createError && (
            <p role="alert" className="text-sm text-red-700 dark:text-red-400">
              {createError}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addCategory}
              disabled={saving}
              className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background disabled:opacity-50"
            >
              Add category
            </button>
            <button
              type="button"
              onClick={cancelCreate}
              className="rounded-md border border-black/20 px-3 py-1.5 text-sm font-medium dark:border-white/25"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
