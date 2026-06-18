import { describe, it, expect } from "vitest";
import { max } from "../max.js";
import { list } from "../../core/list.js";

describe("max", () => {
  it("returns larger of two values", () => {
    expect(max(5, 10)).toBe(10);
  });

  it("handles negative numbers", () => {
    expect(max(-5, -10)).toBe(-5);
  });

  it("with list returns maximum", () => {
    expect(max(list(3, 7, 2, 9))).toBe(9);
  });
});
