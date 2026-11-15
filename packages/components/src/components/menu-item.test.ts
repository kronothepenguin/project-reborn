import { fireEvent, render } from "@testing-library/svelte";
import { userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import MenuFixture from "./__fixtures__/menu.svelte";

function item(container: HTMLElement): HTMLButtonElement {
  return container.querySelector('[role="menuitemradio"]') as HTMLButtonElement;
}

describe("Menu item", () => {
  it("reports its value when selected", async () => {
    const onselect = vi.fn();
    const { container } = render(MenuFixture, {
      props: { items: [{ value: "a", label: "Alpha" }], onselect },
    });
    await fireEvent.click(item(container));
    expect(onselect).toHaveBeenCalledWith("a");
  });

  it("exposes the selected state", () => {
    const { container } = render(MenuFixture, {
      props: { items: [{ value: "a", label: "Alpha", selected: true }] },
    });
    expect(item(container).getAttribute("aria-checked")).toBe("true");
  });

  it("ignores a press on a disabled item", async () => {
    const onselect = vi.fn();
    const { container } = render(MenuFixture, {
      props: { items: [{ value: "a", label: "Alpha", disabled: true }], onselect },
    });
    await fireEvent.click(container.querySelector("button") as HTMLButtonElement);
    await userEvent.click(item(container), { force: true });
    expect(onselect).not.toHaveBeenCalled();
  });
});