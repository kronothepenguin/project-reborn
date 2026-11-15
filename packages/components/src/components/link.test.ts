import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Link from "./link.svelte";
import "../styles.css";

const label = createRawSnippet(() => ({ render: () => "<span>Read more</span>" }));

describe("Link", () => {
  it("renders an anchor element", () => {
    const { container } = render(Link, { props: { children: label, href: "/login" } });
    expect(container.querySelector("a")).toBeTruthy();
  });
});

describe("Link variants", () => {
  it("underlines a default link and shows a nav link plain, in another colour", () => {
    const { container: a } = render(Link, { props: { children: label, href: "#" } });
    const { container: b } = render(Link, { props: { children: label, href: "#", variant: "nav" } });
    const link = getComputedStyle(a.querySelector("a") as HTMLAnchorElement);
    const nav = getComputedStyle(b.querySelector("a") as HTMLAnchorElement);

    expect(link.textDecorationLine).toBe("underline");
    expect(nav.textDecorationLine).toBe("none");
    expect(nav.color).not.toBe(link.color);
  });
});
