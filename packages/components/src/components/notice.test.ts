import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Notice from "./notice.svelte";
import "../styles.css";

const content = createRawSnippet(() => ({ render: () => "<p>Invalid username or password.</p>" }));

describe("Notice", () => {
  it("shows its content in white", () => {
    const { container } = render(Notice, { props: { children: content } });
    const notice = container.querySelector("div") as HTMLDivElement;
    expect(getComputedStyle(notice).color).toBe("rgb(255, 255, 255)");
    expect(notice.textContent).toContain("Invalid username or password.");
  });

  it("shows a red notice by default and a green one on request", () => {
    const red = render(Notice, { props: { children: content } });
    const green = render(Notice, { props: { children: content, variant: "green" } });
    const redStyle = getComputedStyle(red.container.querySelector("div") as HTMLDivElement);
    const greenStyle = getComputedStyle(green.container.querySelector("div") as HTMLDivElement);

    expect(redStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(greenStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(greenStyle.backgroundColor).not.toBe(redStyle.backgroundColor);
  });
});
