import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Bubble from "./bubble.svelte";
import "../styles.css";

const content = createRawSnippet(() => ({ render: () => "<p>Please enter a name.</p>" }));

describe("Bubble", () => {
  it("renders its content", () => {
    const { container } = render(Bubble, { props: { children: content } });
    expect(container.textContent).toContain("Please enter a name.");
  });

  it("points its tail down by default and up on request", () => {
    const down = render(Bubble, { props: { children: content } });
    const up = render(Bubble, { props: { children: content, tail: "top" } });
    const downBox = down.container.querySelector("div") as HTMLDivElement;
    const upBox = up.container.querySelector("div") as HTMLDivElement;
    const downTail = getComputedStyle(downBox, "::before");
    const upTail = getComputedStyle(upBox, "::before");

    expect(parseFloat(downTail.bottom)).toBeLessThan(0);
    expect(parseFloat(downTail.top)).toBeGreaterThan(0);
    expect(parseFloat(upTail.top)).toBeLessThan(0);
    expect(parseFloat(upTail.bottom)).toBeGreaterThan(0);
  });
});
