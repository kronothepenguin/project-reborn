import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { hexHue, hue, hueDistance } from "./__fixtures__/hue";
import TabsFixture from "./__fixtures__/tabs.svelte";
import "../styles.css";

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
describe("Tab colours", () => {
  // Holo's inner-tabs.png: the fill of an unselected tab in each colour.
  it.each([
    ["blue", "#528dc9"],
    ["green", "#3ba800"],
    ["orange", "#ff9900"],
  ] as const)(
    "in a %s box, an unselected tab is filled with the colour in white text, and the selected one is white with an outline in it and bold black text",
    (color, holo) => {
      const { container } = render(TabsFixture, { props: { tabs, value: "a", color } });
      const [selected, unselected] = tabElements(container).map((tab) => getComputedStyle(tab));

      expect(hueDistance(hue(unselected.backgroundColor), hexHue(holo))).toBeLessThan(12);
      expect(unselected.color).toBe("rgb(255, 255, 255)");
      expect(unselected.fontWeight).toBe("400");

      expect(selected.backgroundColor).toBe("rgb(255, 255, 255)");
      expect(selected.borderTopColor).toBe(unselected.backgroundColor);
      expect(selected.borderTopWidth).toBe("1px");
      expect(selected.color).toBe("rgb(0, 0, 0)");
      expect(selected.fontWeight).toBe("700");
    },
  );

  it("writes its label at 12px, Tailwind's closest size to Holo's 11px tabs", () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    expect(getComputedStyle(tabElements(container)[0]).fontSize).toBe("12px");
  });
});
