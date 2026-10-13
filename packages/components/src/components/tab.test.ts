import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TabsFixture from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

function tabElements(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
}

describe("Tab", () => {
  it("exposes the selected state from the Tabs context", () => {
    const { container } = render(TabsFixture, { props: { tabs, value: "b" } });
    const elements = tabElements(container);
    expect(elements[1].getAttribute("aria-selected")).toBe("true");
    expect(elements[0].getAttribute("aria-selected")).toBe("false");
  });

  it("activates on click", async () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    const elements = tabElements(container);
    await fireEvent.click(elements[2]);
    expect(elements[2].getAttribute("aria-selected")).toBe("true");
  });

  it("does not activate when disabled", async () => {
    const { container } = render(TabsFixture, {
      props: { tabs: [{ value: "a", label: "Alpha" }, { value: "b", label: "Beta", disabled: true }] },
    });
    const elements = tabElements(container);
    await fireEvent.click(elements[1]);
    expect(elements[1].getAttribute("aria-selected")).toBe("false");
    expect(elements[0].getAttribute("aria-selected")).toBe("true");
  });
});