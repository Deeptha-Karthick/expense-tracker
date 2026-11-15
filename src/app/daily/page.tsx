import type { Metadata } from "next";
import { DailyView } from "@/components/DailyView";

export const metadata: Metadata = {
  title: "Daily | Expense Tracker",
};

export default function DailyPage() {
  return <DailyView />;
}
