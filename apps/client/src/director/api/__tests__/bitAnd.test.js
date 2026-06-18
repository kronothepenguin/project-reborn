import { describe, it, expect } from "vitest";
import { bitAnd } from "../bitAnd.js";

describe("bitAnd", () => {
  it("performs bitwise AND (example from docs: 6 & 7 = 6)", () => {
    expect(bitAnd(6, 7)).toBe(6);
  });

  it("performs bitwise AND on 5 and 3 (101 & 011 = 001)", () => {
    expect(bitAnd(5, 3)).toBe(1);
  });

  it("returns 0 when ANDed with zero", () => {
    expect(bitAnd(5, 0)).toBe(0);
  });

  it("returns 0 when both operands are zero", () => {
    expect(bitAnd(0, 0)).toBe(0);
  });

  it("is commutative", () => {
    expect(bitAnd(12, 10)).toBe(bitAnd(10, 12));
  });

  it("handles all-ones mask", () => {
    expect(bitAnd(0xff, 0x0f)).toBe(0x0f);
  });

  it("is pure (no side effects)", () => {
    expect(bitAnd(6, 7)).toBe(bitAnd(6, 7));
  });
});
