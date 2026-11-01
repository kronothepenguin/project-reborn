import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Bubble from "./bubble.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Please enter a name.</p>" }));

describe("Bubble", () => {
  it("renders its content", () => {
    const { container } = render(Bubble, { props: { children: content } });
    expect(container.textContent).toContain("Please enter a name.");
  });

  it("forwards native attributes and keeps its look with a class", () => {
    const { container } = render(Bubble, {
      props: { children: content, role: "tooltip", class: "absolute" },
    });
    const bubble = container.querySelector("div") as HTMLDivElement;
    expect(bubble.getAttribute("role")).toBe("tooltip");
    expect(bubble.classList.contains("absolute")).toBe(true);
    expect(bubble.classList.contains("bg-white")).toBe(true);
  });

  it("points down by default and up on request", () => {
    const down = render(Bubble, { props: { children: content } });
    expect((down.container.querySelector("div") as HTMLDivElement).className).toContain("before:-bottom-1.5");
    const up = render(Bubble, { props: { children: content, tail: "top" } });
    expect((up.container.querySelector("div") as HTMLDivElement).className).toContain("before:-top-1.5");
  });
});
