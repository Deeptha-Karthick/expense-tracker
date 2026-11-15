import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { AppNav } from "@/components/AppNav";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

describe("AppNav", () => {
  it("links to the expenses list, the daily view and the summary", () => {
    vi.mocked(usePathname).mockReturnValue("/");
    render(<AppNav />);

    expect(screen.getByRole("link", { name: "Expenses" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Daily" })).toHaveAttribute("href", "/daily");
    expect(screen.getByRole("link", { name: "Summary" })).toHaveAttribute(
      "href",
      "/summary",
    );
  });

  it.each([
    ["/", "Expenses", "Summary"],
    ["/daily", "Daily", "Expenses"],
    ["/summary", "Summary", "Expenses"],
  ])("marks the current page when on %s", (path, current, other) => {
    vi.mocked(usePathname).mockReturnValue(path);
    render(<AppNav />);

    expect(screen.getByRole("link", { name: current })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: other })).not.toHaveAttribute("aria-current");
  });
});
