import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Input from "./input.svelte";
import InputFixture from "./__fixtures__/input.svelte";

describe("Input", () => {
  it("renders a native input element", () => {
    const { container } = render(Input);
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("forwards native input attributes", () => {
    const { container } = render(Input, {
      props: { type: "email", name: "email", placeholder: "you@example.com", disabled: true },
    });
    const input = container.querySelector("input");
    expect(input?.getAttribute("type")).toBe("email");
    expect(input?.getAttribute("name")).toBe("email");
    expect(input?.getAttribute("placeholder")).toBe("you@example.com");
    expect((input as HTMLInputElement).disabled).toBe(true);
  });

  it("writes its value back to a bound parent", async () => {
    const { container } = render(InputFixture);
    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "hello" } });
    expect(input.value).toBe("hello");
    expect(container.querySelector("[data-testid='echo']")?.textContent).toBe("hello");
  });
});

const variants = ["default", "border"] as const;
const variantBorderClasses: Record<(typeof variants)[number], string[]> = {
  default: [],
  border: ["border", "border-neutral-600"],
};

describe("Input variants", () => {
  it("defaults variant to default and applies no border class", () => {
    const { container } = render(Input);
    const input = container.querySelector("input") as HTMLInputElement;
    for (const cls of variantBorderClasses.default) {
      expect(input.classList.contains(cls)).toBe(true);
    }
    expect(input.classList.contains("border")).toBe(false);
  });

  it("applies the border class for the border variant", () => {
    const { container } = render(Input, { props: { variant: "border" } });
    const input = container.querySelector("input") as HTMLInputElement;
    for (const cls of variantBorderClasses.border) {
      expect(input.classList.contains(cls)).toBe(true);
    }
  });

  it("changes only classes, not the element or behaviour", async () => {
    const { container: a } = render(Input, { props: { variant: "default" } });
    const { container: b } = render(Input, { props: { variant: "border" } });
    const first = a.querySelector("input") as HTMLInputElement;
    const second = b.querySelector("input") as HTMLInputElement;
    expect(second.tagName).toBe(first.tagName);
    expect(second.getAttribute("type")).toBe(first.getAttribute("type"));
    await fireEvent.input(second, { target: { value: "hi" } });
    expect(second.value).toBe("hi");
  });

  it("falls back to default for an unsupported variant", () => {
    const { container } = render(Input, { props: { variant: "purple" as never } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains("border")).toBe(false);
    expect(input.classList.contains("bg-white")).toBe(true);
  });

  it("does not forward variant as an attribute", () => {
    const { container } = render(Input, { props: { variant: "border" } });
    expect(container.querySelector("input")?.hasAttribute("variant")).toBe(false);
  });
});

const sizes = ["default", "lg"] as const;
const sizePaddingClasses: Record<(typeof sizes)[number], string> = {
  default: "p-0.5",
  lg: "p-1",
};

describe("Input sizes", () => {
  it("defaults size to default and applies its all-sides padding class", () => {
    const { container } = render(Input);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains(sizePaddingClasses.default)).toBe(true);
    expect(input.classList.contains(sizePaddingClasses.lg)).toBe(false);
  });

  it("applies the all-sides padding class for the given size", () => {
    for (const size of sizes) {
      const { container } = render(Input, { props: { size } });
      const input = container.querySelector("input") as HTMLInputElement;
      expect(input.classList.contains(sizePaddingClasses[size])).toBe(true);
    }
  });

  it("changes only classes, not the element or behaviour", async () => {
    const { container: a } = render(Input, { props: { size: "default" } });
    const { container: b } = render(Input, { props: { size: "lg" } });
    const first = a.querySelector("input") as HTMLInputElement;
    const second = b.querySelector("input") as HTMLInputElement;
    expect(second.tagName).toBe(first.tagName);
    expect(second.getAttribute("type")).toBe(first.getAttribute("type"));
    await fireEvent.input(second, { target: { value: "hi" } });
    expect(second.value).toBe("hi");
  });

  it("falls back to default for an unsupported size", () => {
    const { container } = render(Input, { props: { size: "xl" as never } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains(sizePaddingClasses.default)).toBe(true);
    expect(input.classList.contains(sizePaddingClasses.lg)).toBe(false);
  });

  it("does not forward size as an attribute", () => {
    const { container } = render(Input, { props: { size: "lg" } });
    expect(container.querySelector("input")?.hasAttribute("size")).toBe(false);
  });
});

describe("Input invalid state", () => {
  it("defaults invalid to false and applies the white background with black text", () => {
    const { container } = render(Input);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains("bg-white")).toBe(true);
    expect(input.classList.contains("bg-rose-300")).toBe(false);
    expect(input.classList.contains("text-black")).toBe(true);
  });

  it("applies the invalid background while leaving the rest unchanged", () => {
    const { container } = render(Input, { props: { invalid: true } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains("bg-rose-300")).toBe(true);
    expect(input.classList.contains("bg-white")).toBe(false);
    expect(input.classList.contains("text-black")).toBe(true);
    expect(input.classList.contains(sizePaddingClasses.default)).toBe(true);
    expect(input.classList.contains("border")).toBe(false);
  });

  it("combines independently with the border variant", () => {
    const { container } = render(Input, { props: { variant: "border", invalid: true } });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains("border")).toBe(true);
    expect(input.classList.contains("border-neutral-600")).toBe(true);
    expect(input.classList.contains("bg-rose-300")).toBe(true);
  });

  it("does not forward invalid as an attribute", () => {
    const { container } = render(Input, { props: { invalid: true } });
    expect(container.querySelector("input")?.hasAttribute("invalid")).toBe(false);
  });
});

describe("Input states", () => {
  it("applies the shared focus-visible outline", () => {
    const { container } = render(Input);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.classList.contains("focus-visible:outline-2")).toBe(true);
    expect(input.classList.contains("focus-visible:outline-offset-2")).toBe(true);
    expect(input.classList.contains("focus-visible:outline-black")).toBe(true);
  });

  it("has no catalogue entry for hover, active, or disabled", async () => {
    const stories = await import("./input.stories");
    const entries = Object.keys(stories)
      .filter((key) => key !== "default")
      .sort();
    expect(entries).toEqual(["Border", "Default", "Invalid", "Large"]);
  });

  it("does not change the element or behaviour on hover, press, or disable", async () => {
    const { container } = render(Input);
    const input = container.querySelector("input") as HTMLInputElement;
    const before = input.outerHTML;
    await fireEvent.mouseOver(input);
    await fireEvent.pointerDown(input);
    await fireEvent.mouseUp(input);
    expect(input.outerHTML).toBe(before);

    const { container: disabledContainer } = render(Input, { props: { disabled: true } });
    const disabledInput = disabledContainer.querySelector("input") as HTMLInputElement;
    expect(disabledInput.tagName).toBe("INPUT");
    expect(disabledInput.disabled).toBe(true);
  });
});