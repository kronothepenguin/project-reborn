import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Pagination from "./pagination.svelte";

const pages = createRawSnippet(() => ({ render: () => "<span>1 <a href='?page=2'>2</a></span>" }));

describe("Pagination", () => {
  it("names its pages after Holo's label", () => {
    const { container } = render(Pagination, { props: { children: pages } });
    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("aria-label")).toBe("Pages");
    expect(nav?.textContent?.trim().startsWith("View page:")).toBe(true);
    expect(nav?.querySelector("a")?.getAttribute("href")).toBe("?page=2");
  });

  it("takes another label", () => {
    const { container } = render(Pagination, { props: { children: pages, label: "Page:" } });
    expect(container.querySelector("nav")?.textContent?.trim().startsWith("Page:")).toBe(true);
  });
});
