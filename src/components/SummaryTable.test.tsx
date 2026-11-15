import { render, screen, within } from "@testing-library/react";
import { SummaryTable } from "@/components/SummaryTable";
import { SUMMARY } from "@/test/fixtures";

describe("SummaryTable", () => {
  it("is a named table with category, amount and share columns", () => {
    render(<SummaryTable summary={SUMMARY} />);

    expect(screen.getByRole("table", { name: "Spending by category" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Category" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Amount" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Share" })).toBeInTheDocument();
  });

  it("lists each category with its amount and percentage as text", () => {
    render(<SummaryTable summary={SUMMARY} />);

    const groceries = screen.getByRole("row", { name: /Groceries/ });
    expect(within(groceries).getByText("₹750.00")).toBeInTheDocument();
    expect(within(groceries).getByText("75.0%")).toBeInTheDocument();

    const dineOut = screen.getByRole("row", { name: /Dine out/ });
    expect(within(dineOut).getByText("₹250.00")).toBeInTheDocument();
    expect(within(dineOut).getByText("25.0%")).toBeInTheDocument();
  });

  it("ends with the total", () => {
    render(<SummaryTable summary={SUMMARY} />);

    const total = screen.getByRole("row", { name: /Total/ });
    expect(within(total).getByText("₹1,000.00")).toBeInTheDocument();
  });
});
