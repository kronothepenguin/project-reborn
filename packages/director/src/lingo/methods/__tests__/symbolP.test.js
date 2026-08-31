import { describe, it, expect } from "vitest";
import { symbolP } from "../symbolP.js";

describe("symbolP", () => {
  it("returns true for a symbol", () => {
    expect(symbolP(Symbol.for("test"))).toBe(true);
  });

  it("returns true for a locally created symbol", () => {
    expect(symbolP(Symbol("local"))).toBe(true);
  });

  it("returns false for a string", () => {
    expect(symbolP("test")).toBe(false);
  });

  it("returns false for a number", () => {
    expect(symbolP(42)).toBe(false);
  });

  it("returns false for null", () => {
    expect(symbolP(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(symbolP(undefined)).toBe(false);
  });

  it("returns false for an object", () => {
    expect(symbolP({})).toBe(false);
  });

  it("is pure (no side effects)", () => {
    const s = Symbol.for("test");
    expect(symbolP(s)).toBe(symbolP(s));
  });
});
