import { render } from "@testing-library/svelte";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import Spinner from "./spinner.svelte";

describe("Spinner", () => {
  it("shows the bubbles with a name for screen readers", () => {
    const { container } = render(Spinner);
    const spinner = container.querySelector("span") as HTMLSpanElement;
    expect(getComputedStyle(spinner).backgroundImage).toContain("progress-bubbles");
    expect(page.getByRole("status", { name: "Loading" }).query()).toBeTruthy();
  });
});
