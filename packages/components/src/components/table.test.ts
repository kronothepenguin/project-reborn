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
