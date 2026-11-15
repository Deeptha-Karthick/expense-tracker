import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  /** "status" for loading/empty (polite), "alert" for errors (assertive). */
  role?: "status" | "alert";
  action?: ReactNode;
};

export function StateMessage({ title, description, role = "status", action }: Props) {
  return (
    <div
      role={role}
      className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-black/15 px-4 py-12 text-center dark:border-white/15"
    >
      <p className="font-medium">{title}</p>
      {description && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      )}
      {action}
    </div>
  );
}
