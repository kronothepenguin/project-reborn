import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Paper from "./paper.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Surface content</p>" }));

describe("Paper", () => {
  it("renders a surface container with its content", () => {
    const { container } = render(Paper, { props: { children: content } });
    expect(container.querySelector("div")).toBeTruthy();
    expect(container.textContent).toContain("Surface content");
  });

  it("forwards native attributes", () => {
    const { container } = render(Paper, {
      props: { children: content, class: "surface", "data-testid": "paper" },
    });
    const surface = container.querySelector("div");
    expect(surface?.classList.contains("surface")).toBe(true);
    expect(surface?.getAttribute("data-testid")).toBe("paper");
  });
});