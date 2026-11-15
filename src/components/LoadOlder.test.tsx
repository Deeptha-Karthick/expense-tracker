import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoadOlder } from "@/components/LoadOlder";

const range = { from: "2026-04-01", to: "2026-06-30" };
const buttonName = "Load older (up to 3 months)";

describe("LoadOlder", () => {
  it("loads older expenses when clicked", async () => {
    const user = userEvent.setup();
    const onLoad = vi.fn();
    render(<LoadOlder loaded={false} loading={false} onLoad={onLoad} />);

    await user.click(screen.getByRole("button", { name: buttonName }));

    expect(onLoad).toHaveBeenCalledTimes(1);
  });

  it("shows the range being viewed", () => {
    render(<LoadOlder loaded={false} loading={false} range={range} onLoad={vi.fn()} />);
    expect(screen.getByText("Showing 1 Apr 2026 – 30 Jun 2026")).toBeInTheDocument();
  });

  it("shows no range text before there is a range", () => {
    render(<LoadOlder loaded={false} loading={false} onLoad={vi.fn()} />);
    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument();
  });

  it("disables itself after the older range is loaded", () => {
    render(<LoadOlder loaded loading={false} range={range} onLoad={vi.fn()} />);
    expect(screen.getByRole("button", { name: buttonName })).toBeDisabled();
  });

  it("is disabled while loading", () => {
    render(<LoadOlder loaded={false} loading onLoad={vi.fn()} />);
    expect(screen.getByRole("button", { name: buttonName })).toBeDisabled();
  });
});
