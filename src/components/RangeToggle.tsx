import { PRESETS, type RangePreset } from "@/lib/date-presets";

type Props = {
  value: RangePreset;
  onChange: (preset: RangePreset) => void;
};

export function RangeToggle({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Date range" className="flex flex-wrap gap-2">
      {PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          aria-pressed={preset.value === value}
          onClick={() => onChange(preset.value)}
          className="rounded-full border border-black/20 px-3 py-1.5 text-sm font-medium hover:bg-black/[.04] aria-pressed:border-transparent aria-pressed:bg-foreground aria-pressed:text-background dark:border-white/25 dark:hover:bg-white/[.08]"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
