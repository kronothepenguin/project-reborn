import { describe, it, expect } from "vitest";
import { count } from "../count.js";
import { list, propList } from "../../core/index.js";

describe("count", () => {
  it("returns 3 for list(1, 2, 3)", () => {
    expect(count(list(1, 2, 3))).toBe(3);
  });

  it("returns 0 for an empty list", () => {
    expect(count(list())).toBe(0);
  });

  it("returns 1 for a single-item list", () => {
    expect(count(list("only"))).toBe(1);
  });

  it("returns the count of a propList", () => {
    expect(count(propList(Symbol.for("a"), 1, Symbol.for("b"), 2))).toBe(2);
  });
});
