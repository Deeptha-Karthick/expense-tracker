"use client";

import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { categoryColor } from "@/lib/category-colors";
import { formatTooltipValue } from "@/lib/format";
import type { Summary } from "@/lib/summary";

type Props = { summary: Summary };

const ROW_HEIGHT = 34;
const VERTICAL_PADDING = 16;
// Used until the container has been measured (first render, and tests without layout).
const INITIAL_WIDTH = 640;

const tooltipStyle = {
  background: "var(--background)",
  color: "var(--foreground)",
  border: "1px solid var(--foreground)",
  borderRadius: 6,
};

const axisTick = { fill: "var(--foreground)", fontSize: 13 };

/**
 * Horizontal bars, largest category first, each labelled with its name and amount.
 * The table beside it carries the same information as text, so the chart itself is
 * hidden from assistive technology.
 */
export function CategoryBarChart({ summary }: Props) {
  const bars = summary.byCategory.map((row) => ({
    name: row.name,
    value: row.totalPaise,
    fill: categoryColor(row.categoryId),
  }));
  const height = bars.length * ROW_HEIGHT + VERTICAL_PADDING;

  return (
    <div
      role="img"
      aria-label="Bar chart of spending by category, largest first. The table lists the same figures."
      className="w-full"
    >
      <ResponsiveContainer
        width="100%"
        height={height}
        initialDimension={{ width: INITIAL_WIDTH, height }}
      >
        <BarChart
          data={bars}
          layout="vertical"
          margin={{ top: 0, right: 90, bottom: 0, left: 0 }}
          accessibilityLayer={false}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={axisTick}
          />
          <Tooltip
            cursor={false}
            formatter={formatTooltipValue}
            contentStyle={tooltipStyle}
          />
          <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={formatTooltipValue}
              fill="var(--foreground)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
