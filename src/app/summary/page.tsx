import type { Metadata } from "next";
import { SummaryView } from "@/components/SummaryView";

export const metadata: Metadata = {
  title: "Summary | Expense Tracker",
};

export default function SummaryPage() {
  return <SummaryView />;
}
