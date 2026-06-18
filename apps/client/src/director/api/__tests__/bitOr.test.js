import { describe, it, expect } from "vitest";
import { bitOr } from "../bitOr.js";

describe("bitOr", () => {
  it("performs bitwise OR (example from docs: 5 | 6 = 7)", () => {
    expect(bitOr(5, 6)).toBe(7);
  });

  it("performs bitwise OR on 5 and 3 (101 | 011 = 111)", () => {
    expect(bitOr(5, 3)).toBe(7);
  });

  it("returns the other operand when ORed with zero", () => {
    expect(bitOr(5, 0)).toBe(5);
  });

  it("returns zero when both operands are zero", () => {
    expect(bitOr(0, 0)).toBe(0);
  });

  it("is commutative", () => {
    expect(bitOr(12, 10)).toBe(bitOr(10, 12));
  });

  it("is pure (no side effects)", () => {
    expect(bitOr(5, 6)).toBe(bitOr(5, 6));
  });
});
