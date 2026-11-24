import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import { hexHue, hue, hueDistance } from "./__fixtures__/hue";
import Card from "./card.svelte";
import "../styles.css";

const header = createRawSnippet(() => ({ render: () => "<h2>Profile</h2>" }));
const body = createRawSnippet(() => ({ render: () => "<p>Card body</p>" }));

describe("Card", () => {
  it("renders a structured container for its body", () => {
    const { container } = render(Card, { props: { children: body } });
    expect(container.textContent).toContain("Card body");
  });

  it("renders an optional header region", () => {
    const { container } = render(Card, { props: { header, children: body } });
    expect(container.querySelector("header h2")?.textContent).toBe("Profile");
  });

  it("writes a white header in black and a coloured header in white", () => {
    const white = render(Card, { props: { header, children: body, color: "white" } });
    const green = render(Card, { props: { header, children: body, color: "green" } });
    const whiteBar = getComputedStyle(white.container.querySelector("header") as HTMLElement);
    const greenBar = getComputedStyle(green.container.querySelector("header") as HTMLElement);

    expect(whiteBar.color).toBe("rgb(0, 0, 0)");
    expect(greenBar.color).toBe("rgb(255, 255, 255)");
    expect(greenBar.backgroundColor).not.toBe(whiteBar.backgroundColor);
  });

  // Holo's h2.title colours (style.css), each with a hue of its own.
  it.each([
    ["blue", "#2767a7"],
    ["activehomes", "#51a5d5"],
    ["green", "#4ab501"],
    ["red", "#d64242"],
    ["hcred", "#d64242"],
    ["darkred", "#c73c3c"],
    ["brown", "#a67a3e"],
    ["lightbrown", "#cf9c44"],
    ["rooms", "#225e6a"],
    ["orange", "#f66200"],
    ["promogray", "#9c350f"],
  ] as const)("draws a %s title bar in Holo's hue", (color, holo) => {
    const { container } = render(Card, { props: { header, children: body, color } });
    const bar = getComputedStyle(container.querySelector("header") as HTMLElement);
    expect(hueDistance(hue(bar.backgroundColor), hexHue(holo))).toBeLessThan(12);
  });

  it("draws its title bar as Holo's: bold 14px on a 17px line, 4px above and below, inset 4px from the frame", () => {
    const { container } = render(Card, { props: { header, children: body, color: "blue" } });
    const element = container.querySelector("header") as HTMLElement;
    const bar = getComputedStyle(element);
    expect(bar.fontSize).toBe("14px");
    expect(bar.fontWeight).toBe("700");
    expect(element.getBoundingClientRect().height).toBe(25);
    const inset = getComputedStyle(element.parentElement as HTMLElement);
    expect(inset.paddingTop).toBe("4px");
    expect(inset.paddingLeft).toBe("4px");
  });

  it("insets its content as Holo's box-content, 8px 15px, at Tailwind's 8px 16px", () => {
    const { container } = render(Card, { props: { children: body } });
    const content = getComputedStyle(container.querySelector("p")?.parentElement as HTMLElement);
    expect(content.paddingTop).toBe("8px");
    expect(content.paddingLeft).toBe("16px");
  });
});
