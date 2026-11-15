import { render, screen } from "@testing-library/react";
import { CategoryChip } from "@/components/CategoryChip";

describe("CategoryChip", () => {
  it("shows the category name as text", () => {
    render(<CategoryChip categoryId={3} name="Dine out" />);
    expect(screen.getByText("Dine out")).toBeInTheDocument();
  });

  it("tints its dot with the category's stable color, hidden from assistive tech", () => {
    const { container } = render(<CategoryChip categoryId={3} name="Dine out" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    // jsdom cannot resolve CSS variables, so check the declared value.
    expect(dot).toHaveAttribute("style", expect.stringContaining("var(--cat-3)"));
  });
});
