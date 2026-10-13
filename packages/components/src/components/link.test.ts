import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Link from "./link.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Read more</span>" }));

describe("Link", () => {
  it("renders an anchor element", () => {
    const { container } = render(Link, { props: { children: label, href: "/login" } });
    expect(container.querySelector("a")).toBeTruthy();
  });

  it("forwards native anchor attributes", () => {
    const { container } = render(Link, {
      props: { children: label, href: "/login", target: "_blank", rel: "noreferrer" },
    });
    const anchor = container.querySelector("a");
    expect(anchor?.getAttribute("href")).toBe("/login");
    expect(anchor?.getAttribute("target")).toBe("_blank");
    expect(anchor?.getAttribute("rel")).toBe("noreferrer");
  });
});