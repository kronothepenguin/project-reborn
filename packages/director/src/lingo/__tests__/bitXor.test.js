import { describe, it, expect } from "vitest";
import { bitXor } from "../bitXor.js";

describe("bitXor", () => {
  it("performs bitwise XOR (example from docs: 5 ^ 6 = 3)", () => {
    expect(bitXor(5, 6)).toBe(3);
  });

  it("performs bitwise XOR on 5 and 3 (101 ^ 011 = 110)", () => {
    expect(bitXor(5, 3)).toBe(6);
  });

  it("returns 0 when both operands are equal", () => {
    expect(bitXor(5, 5)).toBe(0);
  });

  it("returns the value when XORed with zero", () => {
    expect(bitXor(42, 0)).toBe(42);
  });

  it("is commutative", () => {
    expect(bitXor(12, 10)).toBe(bitXor(10, 12));
  });

  it("is its own inverse", () => {
    expect(bitXor(bitXor(0xff, 0x0f), 0x0f)).toBe(0xff);
  });

  it("is pure (no side effects)", () => {
    expect(bitXor(5, 6)).toBe(bitXor(5, 6));
  });
});
