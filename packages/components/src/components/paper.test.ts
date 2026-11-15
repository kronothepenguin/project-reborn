import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Paper from "./paper.svelte";
import "../styles.css";

const content = createRawSnippet(() => ({ render: () => "<p>Surface content</p>" }));

describe("Paper", () => {
  it("renders a surface container with its content", () => {
    const { container } = render(Paper, { props: { children: content } });
    expect(container.querySelector("div")).toBeTruthy();
    expect(container.textContent).toContain("Surface content");
  });
});

describe("Paper variants", () => {
  it("shows a white surface by default and a dark one for black", () => {
    const white = render(Paper, { props: { children: content } });
    const black = render(Paper, { props: { children: content, variant: "black" } });
    const whiteStyle = getComputedStyle(white.container.querySelector("div") as HTMLDivElement);
    const blackStyle = getComputedStyle(black.container.querySelector("div") as HTMLDivElement);

    expect(whiteStyle.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(blackStyle.backgroundColor).not.toBe(whiteStyle.backgroundColor);
    expect(blackStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});
