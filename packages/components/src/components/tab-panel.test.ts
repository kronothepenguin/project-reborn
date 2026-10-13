import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TabsFixture from "./__fixtures__/tabs.svelte";

const tabs = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

function tabElements(container: HTMLElement): HTMLButtonElement[] {
  return Array.from(container.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
}

describe("Tab panel", () => {
  it("shows only the panel of the selected tab", () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    expect(container.textContent).toContain("Panel Alpha");
    expect(container.textContent).not.toContain("Panel Beta");
  });

  it("shows its panel when its tab becomes selected", async () => {
    const { container } = render(TabsFixture, { props: { tabs } });
    await fireEvent.click(tabElements(container)[1]);
    expect(container.textContent).toContain("Panel Beta");
    expect(container.textContent).not.toContain("Panel Alpha");
  });
});