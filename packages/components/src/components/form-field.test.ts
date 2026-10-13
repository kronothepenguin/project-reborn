import { createRawSnippet } from "svelte";
import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import FormField from "./form-field.svelte";

const control = createRawSnippet(() => ({
  render: () => '<input name="email" type="email" />',
}));

describe("Form field", () => {
  it("renders the visible label and the control", () => {
    const { container } = render(FormField, {
      props: { label: "Email", children: control },
    });
    expect(container.querySelector("label")?.textContent).toContain("Email");
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("associates the label with the nested control without a caller id", () => {
    const { container } = render(FormField, {
      props: { label: "Email", children: control },
    });
    const label = container.querySelector("label") as HTMLLabelElement;
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.labels).toContain(label);
  });

  it("renders help text in a span", () => {
    const { container } = render(FormField, {
      props: { label: "Email", help: "We never share it", children: control },
    });
    const span = container.querySelector("label > span:last-of-type");
    expect(span?.textContent).toBe("We never share it");
  });

  it("shows the error message and marks the field invalid", () => {
    const { container } = render(FormField, {
      props: { label: "Email", error: "Required", children: control },
    });
    const label = container.querySelector("label");
    expect(label?.textContent).toContain("Required");
    expect(label?.getAttribute("aria-invalid")).toBe("true");
  });
});