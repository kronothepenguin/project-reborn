import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Card from "./card.svelte";

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

  it("forwards native attributes to the surface", () => {
    const { container } = render(Card, {
      props: { children: body, class: "card", "data-testid": "card" },
    });
    const root = container.querySelector("[data-testid='card']");
    expect(root?.classList.contains("card")).toBe(true);
  });
});