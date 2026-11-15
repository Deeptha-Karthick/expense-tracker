import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RangeToggle } from "@/components/RangeToggle";

describe("RangeToggle", () => {
  it("offers the four ranges and marks the selected one", () => {
    render(<RangeToggle value="thisMonth" onChange={vi.fn()} />);

    const group = screen.getByRole("group", { name: "Date range" });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
    expect(screen.getByRole("button", { name: "This month" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Last 30 days" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the chosen preset", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RangeToggle value="last30" onChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Last month" }));
    await user.click(screen.getByRole("button", { name: "90 days" }));

    expect(onChange).toHaveBeenNthCalledWith(1, "lastMonth");
    expect(onChange).toHaveBeenNthCalledWith(2, "last90");
  });
});
