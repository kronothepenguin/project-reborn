import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import Checkbox from "./checkbox.svelte";
import CheckboxFixture from "./__fixtures__/checkbox.svelte";

const content = createRawSnippet(() => ({ render: () => "<b>Remember me</b>" }));

describe("Checkbox", () => {
  it("renders a native checkbox named by its content", () => {
    render(Checkbox, { props: { children: content } });
    expect(page.getByRole("checkbox", { name: "Remember me" }).query()).toBeTruthy();
  });

  it("stays a checkbox whatever type it is given", () => {
    const { container } = render(Checkbox, {
      props: { children: content, type: "text" } as never,
    });
    expect(container.querySelector("input")?.getAttribute("type")).toBe("checkbox");
  });

  it("starts unchecked unless told otherwise", () => {
    const { container: unchecked } = render(Checkbox, { props: { children: content } });
    const { container: checked } = render(Checkbox, {
      props: { children: content, checked: true },
    });
    expect((unchecked.querySelector("input") as HTMLInputElement).checked).toBe(false);
    expect((checked.querySelector("input") as HTMLInputElement).checked).toBe(true);
  });

  it("toggles from its label and writes back to a bound parent", async () => {
    const { container } = render(CheckboxFixture);
    const echo = container.querySelector("[data-testid='echo']");
    expect(echo?.textContent).toBe("false");
    await fireEvent.click(container.querySelector("label span") as HTMLSpanElement);
    expect((container.querySelector("input") as HTMLInputElement).checked).toBe(true);
    expect(echo?.textContent).toBe("true");
  });
});
