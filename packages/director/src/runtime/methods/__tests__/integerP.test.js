import { describe, it, expect } from "vitest";
import { integerP } from "../integerP.js";

describe("integerP", () => {
  it("returns true for an integer", () => {
    expect(integerP(42)).toBe(true);
  });

  it("returns false for a float", () => {
    expect(integerP(3.14)).toBe(false);
  });

  it("returns false for a numeric string", () => {
    expect(integerP("42")).toBe(false);
  });

  it("returns true for zero", () => {
    expect(integerP(0)).toBe(true);
  });

  it("returns true for negative integers", () => {
    expect(integerP(-7)).toBe(true);
  });

  it("returns false for null", () => {
    expect(integerP(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(integerP(undefined)).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(integerP(true)).toBe(false);
  });

  it("is pure (no side effects)", () => {
    expect(integerP(42)).toBe(integerP(42));
  });
});
