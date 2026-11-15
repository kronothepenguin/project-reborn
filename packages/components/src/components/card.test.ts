import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
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
});
