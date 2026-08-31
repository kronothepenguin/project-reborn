import { describe, it, expect } from "vitest";
import { voidP } from "../voidP.js";

describe("voidP", () => {
  it("returns true for undefined", () => {
    expect(voidP(undefined)).toBe(true);
  });

  it("returns true for null", () => {
    expect(voidP(null)).toBe(true);
  });

  it("returns false for a number", () => {
    expect(voidP(42)).toBe(false);
  });

  it("returns false for zero", () => {
    expect(voidP(0)).toBe(false);
  });

  it("returns false for the empty string", () => {
    expect(voidP("")).toBe(false);
  });

  it("returns false for a non-empty string", () => {
    expect(voidP("hello")).toBe(false);
  });

  it("returns false for false", () => {
    expect(voidP(false)).toBe(false);
  });

  it("returns false for an empty object", () => {
    expect(voidP({})).toBe(false);
  });

  it("returns false for an empty array", () => {
    expect(voidP([])).toBe(false);
  });

  it("is pure (no side effects)", () => {
    expect(voidP(undefined)).toBe(voidP(undefined));
  });
});
