import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import PaginationItem from "./pagination-item.svelte";

const number = createRawSnippet(() => ({ render: () => "<span>2</span>" }));

describe("PaginationItem", () => {
  it("links a page that is not the current one", async () => {
    render(PaginationItem, { props: { children: number, href: "/forum?page=2" } });

    const link = page.getByRole("link", { name: "2" });
    await expect.element(link).toHaveAttribute("href", "/forum?page=2");
    await expect.element(link).not.toHaveAttribute("aria-current");
  });

  it("shows the current page as plain text, marked as the current page", () => {
    const { container } = render(PaginationItem, {
      props: { children: number, href: "/forum?page=2", current: true },
    });

    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("[aria-current='page']")?.textContent).toBe("2");
  });
});
