import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import Box from "./box.svelte";
import "../styles.css";

const content = createRawSnippet(() => ({ render: () => "<p>You're already finished in 1 minute!</p>" }));

describe("Box", () => {
  it("shows its title as a heading above its content", async () => {
    render(Box, { props: { title: "Add banners", children: content } });

    const heading = page.getByRole("heading", { name: "Add banners" });
    await expect.element(heading).toBeVisible();
    await expect.element(page.getByText("You're already finished in 1 minute!")).toBeVisible();
    const text = heading.element().compareDocumentPosition(page.getByText("You're already finished").element());
    expect(text & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("writes a blue title bar in white and a gold one in black", () => {
    const blue = render(Box, { props: { title: "Navigation", color: "blue", children: content } });
    const gold = render(Box, { props: { title: "Banner editer", color: "gold", children: content } });
    const blueBar = getComputedStyle(blue.container.querySelector("h2") as HTMLElement);
    const goldBar = getComputedStyle(gold.container.querySelector("h2") as HTMLElement);

    expect(blueBar.color).toBe("rgb(255, 255, 255)");
    expect(goldBar.color).toBe("rgb(0, 0, 0)");
    expect(blueBar.backgroundColor).not.toBe(goldBar.backgroundColor);
    expect(blueBar.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(goldBar.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});
