import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Pagination from "./pagination.svelte";
import PaginationItem from "./pagination-item.svelte";

const pages = createRawSnippet(() => ({ render: () => "<span>1 <a href='?page=2'>2</a></span>" }));
const number = createRawSnippet(() => ({ render: () => "<span>2</span>" }));

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

describe("PaginationItem", () => {
  it("links a page that is not the current one", () => {
    const { container } = render(PaginationItem, { props: { children: number, href: "/forum?page=2" } });
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/forum?page=2");
    expect(link?.textContent).toBe("2");
    expect(container.querySelector("[aria-current]")).toBeNull();
  });

  it("shows the current page as plain text", () => {
    const { container } = render(PaginationItem, { props: { children: number, href: "/forum?page=2", current: true } });
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("span[aria-current='page']")?.textContent).toBe("2");
  });
});
