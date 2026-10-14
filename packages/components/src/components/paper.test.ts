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

const variants = [
  "default",
  "login",
  "gray",
  "black",
  "hc",
  "yellow",
  "lightgreen",
  "blue",
  "room pattern",
] as const;
const variantClasses: Record<(typeof variants)[number], string> = {
  default: "bg-white",
  login: "bg-olive-400",
  gray: "bg-neutral-400",
  black: "bg-olive-950",
  hc: "bg-amber-100",
  yellow: "bg-amber-300",
  lightgreen: "bg-mist-200",
  blue: "bg-sky-300",
  "room pattern": "bg-cyan-600",
};

describe("Paper variants", () => {
  it("defaults variant to default and applies its background class", () => {
    const { container } = render(Paper, { props: { children: content } });
    const surface = container.querySelector("div") as HTMLDivElement;
    expect(surface.classList.contains(variantClasses.default)).toBe(true);
  });

  it("applies the background class for the given variant", () => {
    for (const variant of variants) {
      const { container } = render(Paper, { props: { children: content, variant } });
      const surface = container.querySelector("div") as HTMLDivElement;
      expect(surface.classList.contains(variantClasses[variant])).toBe(true);
    }
  });

  it("changes only classes, not the element or behaviour", () => {
    const { container: a } = render(Paper, { props: { children: content, variant: "default" } });
    const { container: b } = render(Paper, { props: { children: content, variant: "blue" } });
    const first = a.querySelector("div") as HTMLDivElement;
    const second = b.querySelector("div") as HTMLDivElement;
    expect(second.tagName).toBe(first.tagName);
    expect(second.textContent).toContain("Surface content");
    expect(second.classList.contains("bg-sky-300")).toBe(true);
    expect(second.classList.contains("bg-white")).toBe(false);
  });

  it("falls back to default for an unsupported variant", () => {
    const { container } = render(Paper, {
      props: { children: content, variant: "purple" as never },
    });
    const surface = container.querySelector("div") as HTMLDivElement;
    expect(surface.classList.contains(variantClasses.default)).toBe(true);
  });

  it("does not forward variant as an attribute", () => {
    const { container } = render(Paper, { props: { children: content, variant: "blue" } });
    expect(container.querySelector("div")?.hasAttribute("variant")).toBe(false);
  });
});