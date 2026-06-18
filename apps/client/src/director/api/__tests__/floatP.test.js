import { describe, it, expect } from "vitest";
import { floatP } from "../floatP.js";

describe("floatP", () => {
  it("returns true for a floating-point number", () => {
    expect(floatP(3.14)).toBe(true);
  });

  it("returns false for an integer", () => {
    expect(floatP(42)).toBe(false);
  });

  it("returns false for a numeric string", () => {
    expect(floatP("3.14")).toBe(false);
  });

  it("returns false for negative integers", () => {
    expect(floatP(-7)).toBe(false);
  });

  it("returns false for zero", () => {
    expect(floatP(0)).toBe(false);
  });

  it("returns false for null", () => {
    expect(floatP(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(floatP(undefined)).toBe(false);
  });

  it("is pure (no side effects)", () => {
    const v = 3.14;
    expect(floatP(v)).toBe(floatP(v));
  });
});
