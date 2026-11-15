import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Modal } from "@/components/Modal";

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      {open && (
        <Modal title="Details" onClose={() => setOpen(false)}>
          <button type="button">Inside</button>
        </Modal>
      )}
    </>
  );
}

describe("Modal", () => {
  it("is a modal dialog labelled by its title", () => {
    render(
      <Modal title="Details" onClose={vi.fn()}>
        <p>Body</p>
      </Modal>,
    );

    const dialog = screen.getByRole("dialog", { name: "Details" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("moves focus into the dialog when it opens", () => {
    render(
      <Modal title="Details" onClose={vi.fn()}>
        <button type="button">Inside</button>
      </Modal>,
    );

    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Details" onClose={onClose}>
        <button type="button">Inside</button>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the browser cancels the dialog", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Details" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    );

    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked but not when the content is", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Details" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    );

    await user.click(screen.getByText("Body"));
    expect(onClose).not.toHaveBeenCalled();

    await user.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when a press starts inside the panel and ends on the backdrop", () => {
    const onClose = vi.fn();
    render(
      <Modal title="Details" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");

    // Dragging a text selection out of the panel: mousedown inside, mouseup and click outside.
    fireEvent.mouseDown(screen.getByText("Body"));
    fireEvent.mouseUp(dialog);
    fireEvent.click(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes with the Close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Details" onClose={onClose}>
        <p>Body</p>
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes the native dialog when it unmounts", () => {
    const { unmount } = render(
      <Modal title="Details" onClose={vi.fn()}>
        <p>Body</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("open");

    unmount();

    expect(dialog).not.toHaveAttribute("open");
  });

  it("ignores other keys", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal title="Details" onClose={onClose}>
        <button type="button">Inside</button>
      </Modal>,
    );

    await user.keyboard("a");

    expect(onClose).not.toHaveBeenCalled();
  });

  it("returns focus to the element that opened it", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open" });

    await user.click(opener);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(opener).not.toHaveFocus();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
