import { render, screen } from "@testing-library/react";
import { DailyCellValue } from "@/components/DailyCellValue";

describe("DailyCellValue", () => {
  it("shows a dash that screen readers announce as no expenses", () => {
    render(<DailyCellValue />);
    expect(screen.getByLabelText("No expenses")).toBeInTheDocument();
  });

  it("shows the formatted amount for a single expense, with no count", () => {
    render(<DailyCellValue cell={{ totalPaise: 25050, count: 1 }} />);

    expect(screen.getByText("₹250.50")).toBeInTheDocument();
    expect(screen.queryByText(/×/)).not.toBeInTheDocument();
  });

  it("shows the sum and how many expenses it covers", () => {
    render(<DailyCellValue cell={{ totalPaise: 15050, count: 3 }} />);

    expect(screen.getByText(/₹150\.50/)).toBeInTheDocument();
    expect(screen.getByText("×3")).toBeInTheDocument();
  });
});
