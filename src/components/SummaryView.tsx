"use client";

import { useState } from "react";
import { RangeToggle } from "@/components/RangeToggle";
import { SummaryContent } from "@/components/SummaryContent";
import type { RangePreset } from "@/lib/date-presets";
import { formatRangeLabel } from "@/lib/format";
import { useSummary } from "@/lib/hooks/useSummary";

export function SummaryView() {
  const [preset, setPreset] = useState<RangePreset>("last30");
  const { status, summary, error } = useSummary(preset);

  const rangeLabel = summary ? formatRangeLabel(summary.range) : undefined;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-semibold">Summary</h1>
      <RangeToggle value={preset} onChange={setPreset} />
      {rangeLabel && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Showing {rangeLabel}</p>
      )}
      <SummaryContent status={status} summary={summary} error={error} />
    </div>
  );
}
