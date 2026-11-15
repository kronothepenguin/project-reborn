import { fireEvent, render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import Input from "./input.svelte";
import InputFixture from "./__fixtures__/input.svelte";
import "../styles.css";

describe("Input", () => {
  it("renders a native input element", () => {
    const { container } = render(Input);
    expect(container.querySelector("input")).toBeTruthy();
  });

  it("writes its value back to a bound parent", async () => {
    const { container } = render(InputFixture);
    const input = container.querySelector("input") as HTMLInputElement;
    await fireEvent.input(input, { target: { value: "hello" } });
    expect(input.value).toBe("hello");
    expect(container.querySelector("[data-testid='echo']")?.textContent).toBe("hello");
  });
});

describe("Input invalid state", () => {
  it("shows an invalid input in rose instead of white", () => {
    const { container: plain } = render(Input);
    const { container: invalid } = render(Input, { props: { invalid: true } });
    const plainStyle = getComputedStyle(plain.querySelector("input") as HTMLInputElement);
    const invalidStyle = getComputedStyle(invalid.querySelector("input") as HTMLInputElement);

    expect(plainStyle.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(invalidStyle.backgroundColor).not.toBe(plainStyle.backgroundColor);
    expect(invalidStyle.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  });
});
