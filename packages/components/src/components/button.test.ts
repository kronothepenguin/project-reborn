import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { page, userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import Button from "./button.svelte";
import "../styles.css";

const label = createRawSnippet(() => ({ render: () => "<span>Sign in</span>" }));

describe("Button", () => {
  it("renders a native button element", () => {
    const { container } = render(Button, { props: { children: label } });
    expect(container.querySelector("button")).toBeTruthy();
  });

  it("renders a link with href, for an action that is a plain navigation", () => {
    const { container } = render(Button, { props: { children: label, href: "/" } });
    expect(container.querySelector("button")).toBeNull();
    const link = container.querySelector("a");
    expect(link?.getAttribute("href")).toBe("/");
    expect(link?.hasAttribute("type")).toBe(false);
  });

  it("ignores a press while disabled", async () => {
    const onclick = vi.fn();
    render(Button, { props: { children: label, disabled: true, onclick } });

    await userEvent.click(page.getByRole("button", { name: "Sign in" }), { force: true });

    expect(onclick).not.toHaveBeenCalled();
  });
});

describe("Button faces", () => {
  it("shows a raised face with a rounded 2px border", () => {
    const { container } = render(Button, { props: { children: label } });
    const button = container.querySelector("button") as HTMLButtonElement;
    const style = getComputedStyle(button);

    expect(style.borderTopWidth).toBe("2px");
    expect(style.borderTopLeftRadius).toBe("4px");
    expect(getComputedStyle(button, "::before").content).toBe('""');
  });

  it("shows a plain button flat, with a square 1px border and no raised face", () => {
    const { container } = render(Button, { props: { children: label, variant: "plain" } });
    const button = container.querySelector("button") as HTMLButtonElement;
    const style = getComputedStyle(button);

    expect(style.borderTopWidth).toBe("1px");
    expect(style.borderTopColor).toBe("rgb(0, 0, 0)");
    expect(style.borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(button, "::before").content).toBe("none");
  });

  it("writes its label bold at the body size, as Holo's 11px buttons", () => {
    render(Button, { props: { children: label } });
    const button = getComputedStyle(page.getByRole("button", { name: "Sign in" }).element());
    expect(button.fontSize).toBe("16px");
    expect(button.fontWeight).toBe("700");
  });
});
