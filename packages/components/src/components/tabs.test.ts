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

function tabList(container: HTMLElement): HTMLElement {
  return container.querySelector('[role="tablist"]') as HTMLElement;
}

describe("Tabs", () => {
  it("selects the first tab by default", () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    const [first, second] = tabElements(container);
    expect(first.getAttribute("aria-selected")).toBe("true");
    expect(second.getAttribute("aria-selected")).toBe("false");
  });

  it("selects a tab on click and roves the tabindex", async () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    const elements = tabElements(container);
    await fireEvent.click(elements[1]);
    expect(elements[1].getAttribute("aria-selected")).toBe("true");
    expect(elements[1].getAttribute("tabindex")).toBe("0");
    expect(elements[0].getAttribute("tabindex")).toBe("-1");
  });

  it("moves selection with Arrow/Home/End", async () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    const list = tabList(container);
    const elements = tabElements(container);
    await fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(elements[1].getAttribute("aria-selected")).toBe("true");
    await fireEvent.keyDown(list, { key: "End" });
    expect(elements[2].getAttribute("aria-selected")).toBe("true");
    await fireEvent.keyDown(list, { key: "ArrowRight" });
    expect(elements[0].getAttribute("aria-selected")).toBe("true");
    await fireEvent.keyDown(list, { key: "Home" });
    expect(elements[0].getAttribute("aria-selected")).toBe("true");
  });

  it("skips disabled tabs in the keyboard order", async () => {
    const { container } = render(TabsFixture, {
      props: {
        tabs: [
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta", disabled: true },
          { value: "c", label: "Gamma" },
        ],
      },
    });
    await fireEvent.keyDown(tabList(container), { key: "ArrowRight" });
    expect(tabElements(container)[2].getAttribute("aria-selected")).toBe("true");
  });
});