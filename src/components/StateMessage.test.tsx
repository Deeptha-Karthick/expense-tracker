import { render, screen } from "@testing-library/react";
import { StateMessage } from "@/components/StateMessage";

describe("StateMessage", () => {
  it("announces a title politely by default", () => {
    render(<StateMessage title="Loading…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading…");
  });

  it("shows the description and action when given", () => {
    render(
      <StateMessage
        title="Nothing here"
        description="Add something"
        action={<button type="button">Add</button>}
      />,
    );
    expect(screen.getByText("Add something")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("can be an alert for errors", () => {
    render(<StateMessage role="alert" title="Failed" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
  });

  it("omits the description when there is none", () => {
    render(<StateMessage title="Only a title" />);
    expect(screen.getByRole("status").querySelectorAll("p")).toHaveLength(1);
  });
});
