import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SummaryView } from "@/components/SummaryView";
import { fetchSummary } from "@/lib/api-client";
import { presetRange } from "@/lib/date-presets";
import { todayInKolkata } from "@/lib/dates";
import { SUMMARY } from "@/test/fixtures";

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchSummary: vi.fn(),
}));

const mockFetch = vi.mocked(fetchSummary);

afterEach(() => {
  vi.resetAllMocks();
});

describe("SummaryView", () => {
  it("shows loading, then the donut, the table and the range being shown", async () => {
    mockFetch.mockResolvedValue(SUMMARY);
    render(<SummaryView />);

    expect(screen.getByText("Loading summary…")).toBeInTheDocument();

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByText("Showing 1 Jun 2026 – 30 Jun 2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Last 30 days" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("refetches for the chosen range", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue(SUMMARY);
    render(<SummaryView />);
    await screen.findByRole("table");

    await user.click(screen.getByRole("button", { name: "Last month" }));

    expect(screen.getByRole("button", { name: "Last month" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[1][0]).toEqual(presetRange("lastMonth", todayInKolkata()));
  });

  it("shows an empty state when there is no spending", async () => {
    mockFetch.mockResolvedValue({ ...SUMMARY, totalPaise: 0, byCategory: [] });
    render(<SummaryView />);

    expect(await screen.findByText("No expenses in this range")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an error", async () => {
    mockFetch.mockRejectedValue({ response: { data: { error: "Database is down" } } });
    render(<SummaryView />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load the summary");
    expect(screen.getByText("Database is down")).toBeInTheDocument();
  });
});
