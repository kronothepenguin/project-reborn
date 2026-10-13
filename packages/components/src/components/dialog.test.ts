import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { userEvent } from "vitest/browser";
import { describe, expect, it, vi } from "vitest";
import Dialog from "./dialog.svelte";

const children = createRawSnippet(() => ({ render: () => "<p>Dialog body</p>" }));

function dialogElement(container: HTMLElement): HTMLDialogElement {
  return container.querySelector("dialog") as HTMLDialogElement;
}

describe("Dialog", () => {
  it("is closed by default", () => {
    const { container } = render(Dialog, { props: { children } });
    expect(dialogElement(container).open).toBe(false);
  });

  it("opens modally with a centered overlay", async () => {
    const { container, rerender } = render(Dialog, {
      props: { children, open: false, label: "Example" },
    });
    const dialog = dialogElement(container);
    await rerender({ open: true });
    expect(dialog.open).toBe(true);
    expect(dialog.matches(":modal")).toBe(true);
    expect(dialog.getAttribute("aria-label")).toBe("Example");
    expect(getComputedStyle(dialog).position).toBe("fixed");
  });

  it("closes on backdrop click and reports it", async () => {
    const onclose = vi.fn();
    const { container, rerender } = render(Dialog, {
      props: { children, open: false, onclose },
    });
    const dialog = dialogElement(container);
    await rerender({ open: true });
    await fireEvent.click(dialog);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(dialog.open).toBe(false);
    expect(onclose).toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const { container, rerender } = render(Dialog, { props: { children, open: false } });
    const dialog = dialogElement(container);
    await rerender({ open: true });
    await userEvent.keyboard("{Escape}");
    expect(dialog.open).toBe(false);
  });
});