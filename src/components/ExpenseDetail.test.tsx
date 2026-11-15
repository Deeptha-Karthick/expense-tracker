import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpenseDetail } from "@/components/ExpenseDetail";
import { makeExpense } from "@/test/fixtures";

function renderDetail(overrides = {}, onDelete = vi.fn().mockResolvedValue(undefined)) {
  const onEdit = vi.fn();
  render(<ExpenseDetail expense={makeExpense(overrides)} onEdit={onEdit} onDelete={onDelete} />);
  return { onEdit, onDelete };
}

describe("ExpenseDetail", () => {
  it("shows every field", () => {
    renderDetail();

    expect(screen.getByText("Lunch")).toBeInTheDocument();
    expect(screen.getByText("₹250.50")).toBeInTheDocument();
    expect(screen.getByText("15 Jun 2026")).toBeInTheDocument();
    expect(screen.getByText("Dine out")).toBeInTheDocument();
    expect(screen.getByText("Cafe Coffee Day")).toBeInTheDocument();
    expect(screen.getByText("UPI")).toBeInTheDocument();
    expect(screen.getByText("With the team")).toBeInTheDocument();
  });

  it("shows a dash for fields that are empty", () => {
    renderDetail({ merchant: null, paymentMethod: null, notes: null });
    expect(screen.getAllByText("—")).toHaveLength(3);
  });

  it("starts editing when Edit is clicked", async () => {
    const user = userEvent.setup();
    const { onEdit } = renderDetail();

    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it("asks for confirmation before deleting", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDetail();

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("group", { name: "Confirm delete" })).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("backs out of the confirmation without deleting", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDetail();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("group", { name: "Confirm delete" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("deletes after confirmation", async () => {
    const user = userEvent.setup();
    const { onDelete } = renderDetail();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows the API error and lets the person retry when deleting fails", async () => {
    const user = userEvent.setup();
    const onDelete = vi
      .fn()
      .mockRejectedValueOnce({ response: { data: { error: "Expense is locked" } } })
      .mockResolvedValueOnce(undefined);
    renderDetail({}, onDelete);

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Expense is locked");
    expect(screen.getByRole("button", { name: "Yes, delete" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Yes, delete" }));
    expect(onDelete).toHaveBeenCalledTimes(2);
  });

  it("uses a generic message when the failure has no API message", async () => {
    const user = userEvent.setup();
    renderDetail({}, vi.fn().mockRejectedValue(new Error("network")));

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not delete the expense.");
  });
});
