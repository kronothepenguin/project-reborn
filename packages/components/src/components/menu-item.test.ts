import { fireEvent, render } from "@testing-library/svelte";
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

  it("disables a disabled item", () => {
    const { container } = render(MenuFixture, {
      props: { items: [{ value: "a", label: "Alpha", disabled: true }] },
    });
    expect(item(container).disabled).toBe(true);
  });
});