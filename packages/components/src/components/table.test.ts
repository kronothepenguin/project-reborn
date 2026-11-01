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

  it("marks the header with a grey bar and every second row", () => {
    const { container } = render(TableFixture);
    const table = container.querySelector("table") as HTMLTableElement;
    expect(table.classList.contains("[&_th]:bg-olive-200")).toBe(true);
    expect(table.classList.contains("[&_tbody_tr:nth-child(even)]:bg-neutral-100")).toBe(true);
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
