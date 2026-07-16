import { describe, it, expect } from "vitest";
import { makeSubList } from "../makeSubList.js";
import { list } from "../../index.js";

describe("makeSubList", () => {
  it("extracts a middle range", () => {
    const sub = makeSubList(list(1, 2, 3, 4, 5), 2, 4);
    expect(sub.count).toBe(3);
    expect(sub.getAt(1)).toBe(2);
    expect(sub.getAt(2)).toBe(3);
    expect(sub.getAt(3)).toBe(4);
  });

  it("extracts the full range when start=1 and end=count", () => {
    const sub = makeSubList(list(1, 2, 3), 1, 3);
    expect(sub.count).toBe(3);
    expect(sub.getAt(1)).toBe(1);
    expect(sub.getAt(2)).toBe(2);
    expect(sub.getAt(3)).toBe(3);
  });

  it("extracts a single-item sublist when start equals end", () => {
    const sub = makeSubList(list(10, 20, 30), 2, 2);
    expect(sub.count).toBe(1);
    expect(sub.getAt(1)).toBe(20);
  });

  it("returns an empty list when start > end", () => {
    const sub = makeSubList(list(1, 2, 3), 3, 2);
    expect(sub.count).toBe(0);
  });
});
