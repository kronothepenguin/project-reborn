import { render } from "@testing-library/svelte";
import { describe, expect, it } from "vitest";
import TableFixture from "./__fixtures__/table.svelte";
import "../styles.css";

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

  it("draws a plain table as a frame only, with the cells, the header and the rows unstyled", () => {
    const { container } = render(TableFixture, { props: { variant: "plain" } as never });
    const table = container.querySelector("table") as HTMLTableElement;
    const header = table.querySelector("th") as HTMLTableCellElement;
    const cell = table.querySelector("td") as HTMLTableCellElement;
    const secondRow = table.tBodies[0].rows[1];
    const transparent = "rgba(0, 0, 0, 0)";
    expect(getComputedStyle(table).borderCollapse).not.toBe("separate");
    expect(table.getBoundingClientRect().width).toBe(container.getBoundingClientRect().width);
    expect(getComputedStyle(header).backgroundColor).toBe(transparent);
    expect(getComputedStyle(secondRow).backgroundColor).toBe(transparent);
    expect(getComputedStyle(cell).paddingTop).toBe("0px");
    expect(getComputedStyle(cell).verticalAlign).toBe("middle");
  });
});
