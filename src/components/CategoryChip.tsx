import { categoryColor } from "@/lib/category-colors";

type Props = { categoryId: number; name: string };

export function CategoryChip({ categoryId, name }: Props) {
  const dotColor = categoryColor(categoryId);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-2 py-0.5 text-xs dark:border-white/10">
      <span
        aria-hidden="true"
        className="size-2 rounded-full"
        style={{ backgroundColor: dotColor }}
      />
      {name}
    </span>
  );
}
