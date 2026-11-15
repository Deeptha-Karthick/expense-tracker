import { CategoryBarChart } from "@/components/CategoryBarChart";
import { StateMessage } from "@/components/StateMessage";
import { SummaryTable } from "@/components/SummaryTable";
import type { SummaryResponse } from "@/lib/api-client";

type Props = {
  status: "loading" | "success" | "error";
  summary?: SummaryResponse;
  error?: string;
};

/** Chooses between the loading, error, empty and chart-plus-table states. */
export function SummaryContent({ status, summary, error }: Props) {
  if (status === "loading") {
    return <StateMessage title="Loading summary…" />;
  }

  if (status === "error" || !summary) {
    return <StateMessage role="alert" title="Could not load the summary" description={error} />;
  }

  if (summary.totalPaise === 0) {
    return (
      <StateMessage
        title="No expenses in this range"
        description="Pick another range, or add some expenses."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <CategoryBarChart summary={summary} />
      <SummaryTable summary={summary} />
    </div>
  );
}
