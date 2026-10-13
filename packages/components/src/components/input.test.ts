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