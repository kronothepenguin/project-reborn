import { describe, it, expect } from "vitest";
import { union } from "../union.js";
import { list } from "../../core/index.js";

describe("union", () => {
  it("combines two lists with no overlap", () => {
    const result = union(list(1, 2), list(3, 4));
    expect(result.count).toBe(4);
    expect(result.getAt(1)).toBe(1);
    expect(result.getAt(2)).toBe(2);
    expect(result.getAt(3)).toBe(3);
    expect(result.getAt(4)).toBe(4);
  });

  it("dedupes items present in both lists", () => {
    const result = union(list(1, 2), list(2, 3));
    expect(result.count).toBe(3);
    expect(result.getAt(1)).toBe(1);
    expect(result.getAt(2)).toBe(2);
    expect(result.getAt(3)).toBe(3);
  });

  it("preserves the first list when second is empty", () => {
    const result = union(list(1, 2, 3), list());
    expect(result.count).toBe(3);
    expect(result.getAt(1)).toBe(1);
    expect(result.getAt(2)).toBe(2);
    expect(result.getAt(3)).toBe(3);
  });

  it("returns the second list's items when first is empty", () => {
    const result = union(list(), list(4, 5));
    expect(result.count).toBe(2);
    expect(result.getAt(1)).toBe(4);
    expect(result.getAt(2)).toBe(5);
  });

  it("does not mutate the first list", () => {
    const a = list(1, 2);
    union(a, list(2, 3));
    expect(a.count).toBe(2);
  });
});
