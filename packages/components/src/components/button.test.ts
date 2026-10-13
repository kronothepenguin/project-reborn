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