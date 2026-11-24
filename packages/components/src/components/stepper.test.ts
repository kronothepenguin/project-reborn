import { render } from "@testing-library/svelte";
import { page } from "vitest/browser";
import { describe, expect, it } from "vitest";
import StepperFixture from "./__fixtures__/stepper.svelte";
import "../styles.css";

const steps = [
  { label: "Configuration", href: "/installer/config" },
  { label: "Site", href: "/installer/site" },
  { label: "Settings", current: true },
  { label: "Client files" },
  { label: "Administrator" },
];

describe("Stepper", () => {
  it("shows a step passed as a link to it", async () => {
    render(StepperFixture, { props: { steps } });

    await expect.element(page.getByRole("link", { name: "Site", exact: true })).toHaveAttribute("href", "/installer/site");
  });

  it("marks the current step as the current one, and it is no link", async () => {
    render(StepperFixture, { props: { steps } });

    const current = page.getByText("Settings", { exact: true }).element().closest('[aria-current="step"]');
    expect(current).not.toBeNull();
    expect(current?.closest("a")).toBeNull();
    expect(document.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
  });

  it("shows a step still to come plain, as no link", async () => {
    render(StepperFixture, { props: { steps } });

    await expect.element(page.getByText("Client files", { exact: true })).toBeVisible();
    expect(page.getByRole("link", { name: "Client files" }).elements()).toHaveLength(0);
  });

  it("lists the steps in their order, in one row, with an arrow between two", async () => {
    render(StepperFixture, { props: { steps } });

    const list = page.getByRole("list").element();
    expect(list.tagName).toBe("OL");
    const items = page.getByRole("listitem").elements();
    expect(items.map((li) => li.textContent?.trim())).toEqual(steps.map((step) => step.label));
    // One row: every step centred on one line, whatever its height.
    const middles = new Set(
      items.map((li) => {
        const box = li.getBoundingClientRect();
        return Math.round(box.top + box.height / 2);
      }),
    );
    expect(middles.size).toBe(1);
    const arrows = items.map((li) => getComputedStyle(li, "::after").display !== "none");
    expect(arrows).toEqual([true, true, true, true, false]);
  });

  it("draws each step's point at 20px, in proportion to a 12px name", async () => {
    render(StepperFixture, { props: { steps } });

    const points = [...document.querySelectorAll('li span[aria-hidden="true"]')];
    expect(points).toHaveLength(steps.length);
    for (const point of points) {
      const { width, height } = point.getBoundingClientRect();
      expect([width, height]).toEqual([20, 20]);
      expect(getComputedStyle(point).fontSize).toBe("12px");
    }
  });
});
