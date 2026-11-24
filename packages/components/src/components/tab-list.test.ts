import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { hexHue, hue, hueDistance } from "./__fixtures__/hue";
import TabsFixture from "./__fixtures__/tabs.svelte";
import "../styles.css";

const tabs = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

describe("Tab list", () => {
  // Holo's ul.box-tabs: a 1px line in #528dc9, #3ba800 or #ff9900.
  it.each([
    [undefined, "#528dc9"],
    ["blue", "#528dc9"],
    ["green", "#3ba800"],
    ["orange", "#ff9900"],
  ] as const)("in a %s box, a line in the box's colour runs under the row", (color, holo) => {
    const { container } = render(TabsFixture, { props: { tabs, value: "a", color } });
    const list = getComputedStyle(container.querySelector('[role="tablist"]') as HTMLElement);
    const unselected = getComputedStyle(container.querySelectorAll('[role="tab"]')[1] as HTMLElement);

    expect(list.borderBottomWidth).toBe("1px");
    expect(list.borderBottomStyle).toBe("solid");
    expect(hueDistance(hue(list.borderBottomColor), hexHue(holo))).toBeLessThan(12);
    expect(list.borderBottomColor).toBe(unselected.backgroundColor);
  });

  it("runs its line from one edge of its box to the other, under 25px tabs", () => {
    const { container } = render(TabsFixture, { props: { tabs, value: "a" } });
    const list = container.querySelector('[role="tablist"]') as HTMLElement;
    const box = (list.parentElement as HTMLElement).getBoundingClientRect();
    const row = list.getBoundingClientRect();

    expect(row.left).toBe(box.left);
    expect(row.width).toBe(box.width);
    expect(row.height).toBe(26);
    expect((container.querySelector('[role="tab"]') as HTMLElement).getBoundingClientRect().height).toBe(25);
  });
});
