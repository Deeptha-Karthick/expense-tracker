import { render, screen } from "@testing-library/react";
import { SummaryContent } from "@/components/SummaryContent";
import { SUMMARY } from "@/test/fixtures";

describe("SummaryContent", () => {
  it("shows a loading state", () => {
    render(<SummaryContent status="loading" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading summary…");
  });

  it("shows the error message", () => {
    render(<SummaryContent status="error" error="Bad range" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Could not load the summary");
    expect(screen.getByText("Bad range")).toBeInTheDocument();
  });

  it("treats a missing summary as an error", () => {
    render(<SummaryContent status="success" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows an empty state when there is no spending", () => {
    render(
      <SummaryContent
        status="success"
        summary={{ ...SUMMARY, totalPaise: 0, byCategory: [] }}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("No expenses in this range");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows the donut and the table when there is data", () => {
    render(<SummaryContent status="success" summary={SUMMARY} />);

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
