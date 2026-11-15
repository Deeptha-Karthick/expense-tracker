import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { CategorySelect } from "@/components/CategorySelect";
import type { CategoryDTO } from "@/lib/api-client";
import { CATEGORIES, makeCategory } from "@/test/fixtures";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(props: Partial<React.ComponentProps<typeof CategorySelect>> = {}) {
  const onChange = vi.fn();
  const onCreate = vi
    .fn()
    .mockResolvedValue(makeCategory({ id: 99, name: "Gifts", isDefault: false }));
  function ControlledCategorySelect() {
    const [value, setValue] = useState(props.value ?? "");
    return (
      <CategorySelect
        id="category"
        categories={CATEGORIES}
        onCreate={onCreate}
        {...props}
        value={value}
        onChange={(nextValue) => {
          setValue(nextValue);
          onChange(nextValue);
          props.onChange?.(nextValue);
        }}
      />
    );
  }
  render(<ControlledCategorySelect />);
  return { onChange, onCreate, user: userEvent.setup() };
}

const select = () => screen.getByRole("combobox", { name: /Category/ });

describe("CategorySelect", () => {
  it("lists the categories and a new-category option", () => {
    setup();

    expect(screen.getByRole("option", { name: "Groceries" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pets" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "+ New category" })).toBeInTheDocument();
  });

  it("reports the chosen category", async () => {
    const { user, onChange } = setup();

    await user.selectOptions(select(), "Dine out");

    expect(onChange).toHaveBeenCalledWith("3");
  });

  it("shows an error linked to the select", () => {
    setup({ error: "Choose a category" });

    expect(select()).toBeInvalid();
    expect(select()).toHaveAccessibleDescription("Choose a category");
  });

  it("opens an inline form for a new category", async () => {
    const { user } = setup();

    await user.selectOptions(select(), "+ New category");

    expect(screen.getByLabelText("New category name")).toBeInTheDocument();
    expect(select()).toHaveDisplayValue("+ New category");
  });

  it("creates the category and selects it", async () => {
    const { user, onChange, onCreate } = setup();

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "  Gifts ");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(onCreate).toHaveBeenCalledWith("Gifts");
    expect(onChange).toHaveBeenCalledWith("99");
    expect(screen.queryByLabelText("New category name")).not.toBeInTheDocument();
  });

  it("asks for a valid name before calling the API", async () => {
    const { user, onCreate } = setup();

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "   ");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a name (1 to 40 characters)");
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("shows the API error, such as a duplicate name, and keeps the form open", async () => {
    const onCreate = vi
      .fn()
      .mockRejectedValue({ response: { data: { error: "Category already exists" } } });
    const { user, onChange } = setup({ onCreate });

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "groceries");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Category already exists");
    expect(screen.getByLabelText("New category name")).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledTimes(1); // only the clear when the form opened
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("uses a generic message when the API gives none", async () => {
    const { user } = setup({ onCreate: vi.fn().mockRejectedValue(new Error("network")) });

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts");
    await user.click(screen.getByRole("button", { name: "Add category" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not create the category.");
  });

  it("adds the category on Enter without submitting the surrounding form", async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onCreate = vi.fn().mockResolvedValue(makeCategory({ id: 99, name: "Gifts" }));
    const user = userEvent.setup();
    render(
      <form onSubmit={onSubmit}>
        <CategorySelect
          id="category"
          categories={CATEGORIES}
          value=""
          onChange={vi.fn()}
          onCreate={onCreate}
        />
      </form>,
    );

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts{Enter}");

    expect(onCreate).toHaveBeenCalledWith("Gifts");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("ignores other keys in the name field", async () => {
    const { user, onCreate } = setup();

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "abc");

    expect(onCreate).not.toHaveBeenCalled();
  });

  it("clears the selection while the new-category form is open, so the old one cannot be saved", async () => {
    const { user, onChange } = setup({ value: "3" });

    await user.selectOptions(select(), "+ New category");

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("cancels back to the dropdown and restores the previous selection", async () => {
    const { user, onChange } = setup({ value: "3" });

    await user.selectOptions(select(), "+ New category");
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByLabelText("New category name")).not.toBeInTheDocument();
    expect(select()).toHaveDisplayValue("Dine out");
    expect(onChange).toHaveBeenNthCalledWith(1, "");
    expect(onChange).toHaveBeenNthCalledWith(2, "3");
  });

  it("does not start a second creation while one is pending", async () => {
    const pending = deferred<CategoryDTO>();
    const onCreate = vi.fn().mockReturnValue(pending.promise);
    const { user } = setup({ onCreate });

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts{Enter}{Enter}{Enter}");

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Add category" })).toBeDisabled();
  });

  it("leaves the person's later choice alone when a slow creation finishes after they picked another category", async () => {
    const pending = deferred<CategoryDTO>();
    const { user, onChange } = setup({ onCreate: vi.fn().mockReturnValue(pending.promise) });

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts");
    await user.click(screen.getByRole("button", { name: "Add category" }));
    await user.selectOptions(select(), "Groceries");
    expect(onChange).toHaveBeenLastCalledWith("1");

    await act(async () => pending.resolve(makeCategory({ id: 99, name: "Gifts" })));

    expect(onChange).not.toHaveBeenCalledWith("99");
    expect(onChange).toHaveBeenLastCalledWith("1");
    expect(select()).toHaveDisplayValue("Groceries");
    expect(screen.queryByLabelText("New category name")).not.toBeInTheDocument();
  });

  it("does not select a slow creation's result after the person cancelled", async () => {
    const pending = deferred<CategoryDTO>();
    const { user, onChange } = setup({
      value: "3",
      onCreate: vi.fn().mockReturnValue(pending.promise),
    });

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts");
    await user.click(screen.getByRole("button", { name: "Add category" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await act(async () => pending.resolve(makeCategory({ id: 99, name: "Gifts" })));

    expect(onChange).not.toHaveBeenCalledWith("99");
    expect(onChange).toHaveBeenLastCalledWith("3");
    expect(select()).toHaveDisplayValue("Dine out");
  });

  it("ignores a slow failure after the person cancelled", async () => {
    const pending = deferred<CategoryDTO>();
    const { user } = setup({ onCreate: vi.fn().mockReturnValue(pending.promise) });

    await user.selectOptions(select(), "+ New category");
    await user.type(screen.getByLabelText("New category name"), "Gifts");
    await user.click(screen.getByRole("button", { name: "Add category" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await act(async () => pending.reject(new Error("late failure")));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("switches back to a normal choice after opening the new-category form", async () => {
    const { user, onChange } = setup();

    await user.selectOptions(select(), "+ New category");
    await user.selectOptions(select(), "Groceries");

    expect(screen.queryByLabelText("New category name")).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith("1");
  });
});
