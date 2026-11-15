import type { DateRange } from "@/lib/date-range";
import { formatRangeLabel } from "@/lib/format";

type Props = {
  /** True once the wider range has been requested; the button then stays disabled. */
  loaded: boolean;
  loading: boolean;
  range?: DateRange;
  onLoad: () => void;
};

export function LoadOlder({ loaded, loading, range, onLoad }: Props) {
  const rangeLabel = range ? formatRangeLabel(range) : undefined;

  return (
    <div className="flex flex-col items-center gap-2 pt-4">
      <button
        type="button"
        onClick={onLoad}
        disabled={loaded || loading}
        className="rounded-md border border-black/20 px-4 py-2 text-sm font-medium hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/25 dark:hover:bg-white/[.08]"
      >
        Load older (up to 3 months)
      </button>
      {rangeLabel && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Showing {rangeLabel}</p>
      )}
    </div>
  );
}
