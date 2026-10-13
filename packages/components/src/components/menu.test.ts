import { fireEvent, render } from "@testing-library/svelte";
import { userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import MenuFixture from "./__fixtures__/menu.svelte";

const items = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

function popover(container: HTMLElement): HTMLElement {
  return container.querySelector("[popover]") as HTMLElement;
}

function trigger(container: HTMLElement): HTMLButtonElement {
  return container.querySelector("button") as HTMLButtonElement;
}

describe("Menu", () => {
  it("opens a popover list from its trigger", async () => {
    const { container } = render(MenuFixture, { props: { label: "Actions", items } });
    expect(popover(container).matches(":popover-open")).toBe(false);
    await fireEvent.click(trigger(container));
    expect(popover(container).matches(":popover-open")).toBe(true);
  });

  it("fires onselect with the item value and closes", async () => {
    const onselect = vi.fn();
    const { container } = render(MenuFixture, { props: { label: "Actions", items, onselect } });
    await fireEvent.click(trigger(container));
    await fireEvent.click(container.querySelector('[role="menuitemradio"]') as HTMLButtonElement);
    expect(onselect).toHaveBeenCalledWith("a");
    expect(popover(container).matches(":popover-open")).toBe(false);
  });

  it("closes on light dismiss", async () => {
    const { container } = render(MenuFixture, { props: { label: "Actions", items } });
    await fireEvent.click(trigger(container));
    expect(popover(container).matches(":popover-open")).toBe(true);
    await userEvent.click(document.body);
    expect(popover(container).matches(":popover-open")).toBe(false);
  });

  it("disables the trigger when disabled", async () => {
    const { container } = render(MenuFixture, {
      props: { label: "Actions", items, disabled: true },
    });
    const button = trigger(container);
    expect(button.disabled).toBe(true);
    await fireEvent.click(button);
    expect(popover(container).matches(":popover-open")).toBe(false);
  });
});