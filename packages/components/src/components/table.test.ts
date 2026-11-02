import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TableFixture from "./__fixtures__/table.svelte";

describe("Table", () => {
  it("renders a native table with the rows it is given", () => {
    const { container } = render(TableFixture);
    const table = container.querySelector("table") as HTMLTableElement;
    expect(table.tHead?.rows).toHaveLength(1);
    expect(table.tBodies[0].rows).toHaveLength(2);
    expect(table.textContent).toContain("Frank");
  });

  it("fills its container", () => {
    const { container } = render(TableFixture);
    expect(container.querySelector("table")?.classList.contains("w-full")).toBe(true);
  });

  it("marks a list's header and every second row in gold", () => {
    const { container } = render(TableFixture);
    const table = container.querySelector("table") as HTMLTableElement;
    expect(table.classList.contains("[&_th]:bg-amber-300")).toBe(true);
    expect(table.classList.contains("[&_tbody_tr:nth-child(even)]:bg-amber-100")).toBe(true);
  });

  it("leaves a form's rows plain", () => {
    const { container } = render(TableFixture, { props: { variant: "form" } as never });
    const table = container.querySelector("table") as HTMLTableElement;
    expect(table.classList.contains("[&_th]:bg-amber-300")).toBe(false);
    expect(table.classList.contains("[&_tbody_tr:nth-child(even)]:bg-amber-100")).toBe(false);
    expect(table.classList.contains("[&_td]:p-1")).toBe(true);
  });

  it("forwards native attributes", () => {
    const { container } = render(TableFixture, {
      props: { "aria-label": "Staff", "data-testid": "staff" } as never,
    });
    const table = container.querySelector("table");
    expect(table?.getAttribute("aria-label")).toBe("Staff");
    expect(table?.getAttribute("data-testid")).toBe("staff");
  });
});
