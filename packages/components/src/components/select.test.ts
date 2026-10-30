import { createRawSnippet } from "svelte";
import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Select from "./select.svelte";
import SelectFixture from "./__fixtures__/select.svelte";

const option = createRawSnippet(() => ({ render: () => '<option value="1">Day</option>' }));

describe("Select", () => {
  it("renders a native select with its options", () => {
    const { container } = render(Select, { props: { children: option } });
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.options).toHaveLength(1);
    expect(select.options[0].textContent).toBe("Day");
  });

  it("forwards native select attributes", () => {
    const { container } = render(Select, {
      props: { children: option, name: "day", required: true, disabled: true },
    });
    const select = container.querySelector("select") as HTMLSelectElement;
    expect(select.getAttribute("name")).toBe("day");
    expect(select.required).toBe(true);
    expect(select.disabled).toBe(true);
  });

  it("starts on the value of a bound parent", () => {
    const { container } = render(SelectFixture);
    expect((container.querySelector("select") as HTMLSelectElement).value).toBe("2");
  });

  it("writes its value back to a bound parent", async () => {
    const { container } = render(SelectFixture);
    const select = container.querySelector("select") as HTMLSelectElement;
    select.value = "3";
    await fireEvent.change(select);
    expect(container.querySelector("[data-testid='echo']")?.textContent).toBe("3");
  });
});
