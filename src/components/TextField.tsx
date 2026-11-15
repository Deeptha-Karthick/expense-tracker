import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: HTMLInputTypeAttribute;
  inputMode?: "text" | "decimal";
  multiline?: boolean;
  required?: boolean;
};

const INPUT_CLASS =
  "w-full rounded-md border border-black/20 bg-transparent px-3 py-2 text-sm aria-[invalid=true]:border-red-700 dark:border-white/25 dark:aria-[invalid=true]:border-red-400";

/** A labelled input (or textarea) with an inline error linked via aria-describedby. */
export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  inputMode,
  multiline = false,
  required = false,
}: Props) {
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : undefined;

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    onChange(event.target.value);
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          rows={3}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={INPUT_CLASS}
        />
      ) : (
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={handleChange}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-required={required}
          className={INPUT_CLASS}
        />
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
