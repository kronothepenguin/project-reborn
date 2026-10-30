import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Notice from "./notice.svelte";

const content = createRawSnippet(() => ({ render: () => "<p>Invalid username or password.</p>" }));

const variants = ["red", "green", "orange", "blue", "darkgray"] as const;
const variantClasses: Record<(typeof variants)[number], string> = {
  red: "bg-red-600",
  green: "bg-lime-600",
  orange: "bg-amber-500",
  blue: "bg-cyan-600",
  darkgray: "bg-mist-600",
};

describe("Notice", () => {
  it("renders white text with its content", () => {
    const { container } = render(Notice, { props: { children: content } });
    const notice = container.querySelector("div") as HTMLDivElement;
    expect(notice.classList.contains("text-white")).toBe(true);
    expect(notice.textContent).toContain("Invalid username or password.");
  });

  it("forwards native attributes", () => {
    const { container } = render(Notice, {
      props: { children: content, role: "alert", "data-testid": "notice" },
    });
    const notice = container.querySelector("div");
    expect(notice?.getAttribute("role")).toBe("alert");
    expect(notice?.getAttribute("data-testid")).toBe("notice");
  });

  it("defaults to red", () => {
    const { container } = render(Notice, { props: { children: content } });
    expect(container.querySelector("div")?.classList.contains(variantClasses.red)).toBe(true);
  });

  it("applies the background class for the given variant", () => {
    for (const variant of variants) {
      const { container } = render(Notice, { props: { children: content, variant } });
      const notice = container.querySelector("div") as HTMLDivElement;
      expect(notice.classList.contains(variantClasses[variant])).toBe(true);
    }
  });

  it("falls back to red for an unsupported variant", () => {
    const { container } = render(Notice, {
      props: { children: content, variant: "purple" as never },
    });
    expect(container.querySelector("div")?.classList.contains(variantClasses.red)).toBe(true);
  });

  it("does not forward variant as an attribute", () => {
    const { container } = render(Notice, { props: { children: content, variant: "blue" } });
    expect(container.querySelector("div")?.hasAttribute("variant")).toBe(false);
  });
});
