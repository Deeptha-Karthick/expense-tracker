import { render, screen, within } from "@testing-library/react";
import { CategoryBarChart } from "@/components/CategoryBarChart";
import { SUMMARY } from "@/test/fixtures";

// Recharts also adds a hidden off-screen span used to measure text, which repeats the
// labels; query inside the chart's own <svg> to look at what is actually drawn.
function renderChart() {
  const { container } = render(<CategoryBarChart summary={SUMMARY} />);
  const svg = container.querySelector("svg") as unknown as HTMLElement;
  return { container, chart: within(svg) };
}

describe("CategoryBarChart", () => {
  it("is exposed as one image that points to the table", () => {
    renderChart();

    expect(
      screen.getByRole("img", { name: /spending by category.*table/i }),
    ).toBeInTheDocument();
  });

  it("names each category and prints its amount next to the bar", () => {
    const { chart } = renderChart();

    expect(chart.getByText("Groceries")).toBeInTheDocument();
    expect(chart.getByText("Dine out")).toBeInTheDocument();
    expect(chart.getByText("₹750.00")).toBeInTheDocument();
    expect(chart.getByText("₹250.00")).toBeInTheDocument();
  });

  it("draws one bar per category in that category's color", () => {
    const { container } = renderChart();

    const bars = container.querySelectorAll(".recharts-bar-rectangle path");
    expect(bars).toHaveLength(2);
    expect(bars[0]).toHaveAttribute("fill", "var(--cat-1)");
    expect(bars[1]).toHaveAttribute("fill", "var(--cat-3)");
  });

  it("keeps the largest category first, top to bottom", () => {
    const { chart } = renderChart();

    const groceries = chart.getByText("Groceries");
    const dineOut = chart.getByText("Dine out");
    expect(groceries.compareDocumentPosition(dineOut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
