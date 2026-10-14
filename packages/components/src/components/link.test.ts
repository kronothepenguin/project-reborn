import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
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

const variants = [
  "default",
  "white",
  "personal-info",
  "nav",
  "settings",
  "yellow",
] as const;
const variantClasses: Record<(typeof variants)[number], string> = {
  default: "text-orange-500 underline",
  white: "text-white underline",
  "personal-info": "text-white no-underline",
  nav: "text-blue-900 no-underline",
  settings: "text-olive-800 no-underline",
  yellow: "text-amber-300 underline",
};

describe("Link variants", () => {
  it("defaults variant to default and applies its colour and decoration", () => {
    const { container } = render(Link, { props: { children: label, href: "#" } });
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    for (const cls of variantClasses.default.split(" ")) {
      expect(anchor.classList.contains(cls)).toBe(true);
    }
  });

  it("applies the colour and text-decoration classes for the given variant", () => {
    for (const variant of variants) {
      const { container } = render(Link, { props: { children: label, href: "#", variant } });
      const anchor = container.querySelector("a") as HTMLAnchorElement;
      for (const cls of variantClasses[variant].split(" ")) {
        expect(anchor.classList.contains(cls)).toBe(true);
      }
    }
  });

  it("removes the underline only for personal-info, nav, and settings", () => {
    const noUnderline = ["personal-info", "nav", "settings"];
    for (const variant of variants) {
      const { container } = render(Link, { props: { children: label, href: "#", variant } });
      const anchor = container.querySelector("a") as HTMLAnchorElement;
      if (noUnderline.includes(variant)) {
        expect(anchor.classList.contains("no-underline")).toBe(true);
        expect(anchor.classList.contains("underline")).toBe(false);
      } else {
        expect(anchor.classList.contains("underline")).toBe(true);
        expect(anchor.classList.contains("no-underline")).toBe(false);
      }
    }
  });

  it("changes only classes, not the element or behaviour", () => {
    const { container: a } = render(Link, { props: { children: label, href: "#", variant: "default" } });
    const { container: b } = render(Link, { props: { children: label, href: "#", variant: "nav" } });
    const first = a.querySelector("a") as HTMLAnchorElement;
    const second = b.querySelector("a") as HTMLAnchorElement;
    expect(second.tagName).toBe(first.tagName);
    expect(second.getAttribute("href")).toBe(first.getAttribute("href"));
    expect(second.querySelector("span")?.textContent).toBe("Read more");
    expect(second.classList.contains("text-blue-900")).toBe(true);
    expect(second.classList.contains("text-orange-500")).toBe(false);
  });

  it("falls back to default for an unsupported variant", () => {
    const { container } = render(Link, {
      props: { children: label, href: "#", variant: "purple" as never },
    });
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    for (const cls of variantClasses.default.split(" ")) {
      expect(anchor.classList.contains(cls)).toBe(true);
    }
  });

  it("does not forward variant as an attribute", () => {
    const { container } = render(Link, { props: { children: label, href: "#", variant: "nav" } });
    expect(container.querySelector("a")?.hasAttribute("variant")).toBe(false);
  });
});

describe("Link states", () => {
  it("applies the shared focus-visible outline", () => {
    const { container } = render(Link, { props: { children: label, href: "#" } });
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    expect(anchor.classList.contains("focus-visible:outline-2")).toBe(true);
    expect(anchor.classList.contains("focus-visible:outline-offset-2")).toBe(true);
    expect(anchor.classList.contains("focus-visible:outline-black")).toBe(true);
  });

  it("has no catalogue entry for hover or active", async () => {
    const stories = await import("./link.stories");
    const entries = Object.keys(stories)
      .filter((key) => key !== "default")
      .sort();
    expect(entries).toEqual(["Default", "Nav", "PersonalInfo", "Settings", "White", "Yellow"]);
  });

  it("does not change the element or behaviour on hover or press", async () => {
    const { container } = render(Link, { props: { children: label, href: "#" } });
    const anchor = container.querySelector("a") as HTMLAnchorElement;
    const before = anchor.outerHTML;
    await fireEvent.mouseOver(anchor);
    await fireEvent.pointerDown(anchor);
    await fireEvent.mouseUp(anchor);
    expect(anchor.outerHTML).toBe(before);
  });
});