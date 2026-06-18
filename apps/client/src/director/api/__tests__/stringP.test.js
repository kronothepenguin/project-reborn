import { describe, it, expect } from "vitest";
import { stringP } from "../stringP.js";

describe("stringP", () => {
  it("returns true for a string", () => {
    expect(stringP("hello")).toBe(true);
  });

  it("returns true for the empty string", () => {
    expect(stringP("")).toBe(true);
  });

  it("returns false for a number", () => {
    expect(stringP(42)).toBe(false);
  });

  it("returns false for a float", () => {
    expect(stringP(3.0)).toBe(false);
  });

  it("returns false for null", () => {
    expect(stringP(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(stringP(undefined)).toBe(false);
  });

  it("returns false for a symbol", () => {
    expect(stringP(Symbol.for("x"))).toBe(false);
  });

  it("is pure (no side effects)", () => {
    expect(stringP("hello")).toBe(stringP("hello"));
  });
});
