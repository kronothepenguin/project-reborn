import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Button from "./button.svelte";

const label = createRawSnippet(() => ({ render: () => "<span>Sign in</span>" }));

describe("Button", () => {
  it("renders a native button element", () => {
    const { container } = render(Button, { props: { children: label } });
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("defaults type to button", () => {
    const { container } = render(Button, { props: { children: label } });
    expect(container.querySelector("button")?.getAttribute("type")).toBe("button");
  });

  it("forwards native attributes to the element", () => {
    const { container } = render(Button, {
      props: {
        children: label,
        type: "submit",
        class: "primary",
        "data-testid": "submit",
      },
    });
    const button = container.querySelector("button");
    expect(button?.getAttribute("type")).toBe("submit");
    expect(button?.getAttribute("data-testid")).toBe("submit");
    expect(button?.classList.contains("primary")).toBe(true);
  });

  it("reflects the disabled state", () => {
    const { container } = render(Button, { props: { children: label, disabled: true } });
    expect((container.querySelector("button") as HTMLButtonElement).disabled).toBe(true);
  });
});

const variants = ["default", "green", "dark", "red"] as const;
const variantClasses: Record<(typeof variants)[number], string[]> = {
  default: [
    "text-black",
    "bg-mauve-300",
    "hover:bg-olive-200",
    "before:bg-olive-200",
    "hover:before:bg-white",
  ],
  green: [
    "text-white",
    "bg-lime-700",
    "hover:bg-green-600",
    "before:bg-lime-600",
    "hover:before:bg-lime-500",
  ],
  dark: [
    "text-white",
    "bg-olive-600",
    "hover:bg-neutral-500",
    "before:bg-olive-500",
    "hover:before:bg-mist-400",
  ],
  red: [
    "text-white",
    "bg-red-700",
    "hover:bg-red-600",
    "before:bg-red-600",
    "hover:before:bg-red-500",
  ],
};

describe("Button variants", () => {
  it("defaults variant to default and applies its class set", () => {
    const { container } = render(Button, { props: { children: label } });
    const button = container.querySelector("button") as HTMLButtonElement;
    for (const cls of variantClasses.default) {
      expect(button.classList.contains(cls)).toBe(true);
    }
  });

  it("applies the class set for the given variant", () => {
    for (const variant of variants) {
      const { container } = render(Button, { props: { children: label, variant } });
      const button = container.querySelector("button") as HTMLButtonElement;
      for (const cls of variantClasses[variant]) {
        expect(button.classList.contains(cls)).toBe(true);
      }
    }
  });

  it("changes only classes, not the element or behaviour", () => {
    const { container: a } = render(Button, { props: { children: label, variant: "default" } });
    const { container: b } = render(Button, { props: { children: label, variant: "red" } });
    const first = a.querySelector("button") as HTMLButtonElement;
    const second = b.querySelector("button") as HTMLButtonElement;
    expect(second.tagName).toBe(first.tagName);
    expect(second.getAttribute("type")).toBe(first.getAttribute("type"));
    expect(second.querySelector("span")?.textContent).toBe("Sign in");
    expect(second.classList.contains("bg-red-700")).toBe(true);
    expect(second.classList.contains("bg-mauve-300")).toBe(false);
  });

  it("does not forward variant as an attribute", () => {
    const { container } = render(Button, { props: { children: label, variant: "green" } });
    expect(container.querySelector("button")?.hasAttribute("variant")).toBe(false);
  });
});

const sizes = ["wide", "compact"] as const;
const sizeClasses: Record<(typeof sizes)[number], string> = {
  wide: "px-4",
  compact: "px-2",
};

describe("Button sizes", () => {
  it("defaults size to wide and applies its horizontal-padding class", () => {
    const { container } = render(Button, { props: { children: label } });
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.classList.contains(sizeClasses.wide)).toBe(true);
  });

  it("applies the horizontal-padding class for the given size", () => {
    for (const size of sizes) {
      const { container } = render(Button, { props: { children: label, size } });
      const button = container.querySelector("button") as HTMLButtonElement;
      expect(button.classList.contains(sizeClasses[size])).toBe(true);
    }
  });

  it("applies the surface-theme vertical padding and typography", () => {
    const { container } = render(Button, { props: { children: label } });
    const button = container.querySelector("button") as HTMLButtonElement;
    expect(button.classList.contains("py-1")).toBe(true);
    expect(button.classList.contains("text-xs")).toBe(true);
    expect(button.classList.contains("font-bold")).toBe(true);
  });

  it("changes only classes, not the element or behaviour", () => {
    const { container: a } = render(Button, { props: { children: label, size: "wide" } });
    const { container: b } = render(Button, { props: { children: label, size: "compact" } });
    const first = a.querySelector("button") as HTMLButtonElement;
    const second = b.querySelector("button") as HTMLButtonElement;
    expect(second.tagName).toBe(first.tagName);
    expect(second.getAttribute("type")).toBe(first.getAttribute("type"));
    expect(second.querySelector("span")?.textContent).toBe("Sign in");
    expect(second.classList.contains("px-2")).toBe(true);
    expect(second.classList.contains("px-4")).toBe(false);
  });

  it("does not forward size as an attribute", () => {
    const { container } = render(Button, { props: { children: label, size: "compact" } });
    expect(container.querySelector("button")?.hasAttribute("size")).toBe(false);
  });
});