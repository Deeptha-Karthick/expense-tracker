import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField } from "@/components/TextField";

describe("TextField", () => {
  it("labels the input", () => {
    render(<TextField id="purpose" label="Purpose" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Purpose")).toBeInTheDocument();
  });

  it("reports what the person types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField id="purpose" label="Purpose" value="" onChange={onChange} />);

    await user.type(screen.getByLabelText("Purpose"), "a");

    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("shows the current value", () => {
    render(<TextField id="purpose" label="Purpose" value="Lunch" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Purpose")).toHaveValue("Lunch");
  });

  it("links an error to the input", () => {
    render(
      <TextField id="amount" label="Amount" value="" onChange={vi.fn()} error="Enter an amount" />,
    );

    const input = screen.getByLabelText("Amount");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Enter an amount");
  });

  it("is valid when there is no error", () => {
    render(<TextField id="amount" label="Amount" value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText("Amount")).toBeValid();
  });

  it("marks required fields", () => {
    render(<TextField id="purpose" label="Purpose" value="" onChange={vi.fn()} required />);
    expect(screen.getByLabelText(/Purpose/)).toBeRequired();
  });

  it("can be a multi-line textarea", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TextField id="notes" label="Notes" value="" onChange={onChange} multiline />);

    const notes = screen.getByRole("textbox", { name: "Notes" });
    expect(notes.tagName).toBe("TEXTAREA");
    await user.type(notes, "x");
    expect(onChange).toHaveBeenCalledWith("x");
  });
});
