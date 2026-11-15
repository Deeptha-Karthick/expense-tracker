import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("test setup", () => {
  it("renders with React Testing Library in jsdom", () => {
    render(<h1>Expense Tracker</h1>);
    expect(
      screen.getByRole("heading", { name: "Expense Tracker" }),
    ).toBeInTheDocument();
  });
});
