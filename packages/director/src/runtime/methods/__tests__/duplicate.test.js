import { describe, it, expect } from "vitest";
import { duplicate } from "../duplicate.js";
import { list, propList } from "../../index.js";

describe("duplicate", () => {
  it("creates a copy of the list with same values", () => {
    const original = list(1, 2, 3);
    const copy = duplicate(original);
    expect(copy.count).toBe(3);
    expect(copy.getAt(1)).toBe(1);
    expect(copy.getAt(2)).toBe(2);
    expect(copy.getAt(3)).toBe(3);
  });

  it("returns a different list instance (shallow copy)", () => {
    const original = list(1, 2, 3);
    const copy = duplicate(original);
    expect(copy).not.toBe(original);
  });

  it("is a shallow copy — mutating original does not affect the duplicate", () => {
    const original = list(1, 2, 3);
    const copy = duplicate(original);
    original.add(99);
    expect(copy.count).toBe(3);
    expect(original.count).toBe(4);
  });

  it("duplicates a propList", () => {
    const original = propList(Symbol.for("a"), 1, Symbol.for("b"), 2);
    const copy = duplicate(original);
    expect(copy.count).toBe(2);
    expect(copy.getProp(Symbol.for("a"))).toBe(1);
    expect(copy.getProp(Symbol.for("b"))).toBe(2);
  });
});
