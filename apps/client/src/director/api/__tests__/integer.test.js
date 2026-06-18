import { describe, it, expect } from "vitest";
import { integer } from "../integer.js";

describe("integer", () => {
  it("rounds 3.9 up to 4", () => {
    expect(integer(3.9)).toBe(4);
  });

  it("rounds 3.75 to nearest (4)", () => {
    expect(integer(3.75)).toBe(4);
  });

  it("rounds 3.4 down to 3", () => {
    expect(integer(3.4)).toBe(3);
  });

  it("rounds -3.9 to -4", () => {
    expect(integer(-3.9)).toBe(-4);
  });

  it("converts numeric string to integer", () => {
    expect(integer("42")).toBe(42);
  });

  it("leaves integers unchanged", () => {
    expect(integer(42)).toBe(42);
  });

  it("is pure (no side effects)", () => {
    expect(integer(3.9)).toBe(integer(3.9));
  });
});
