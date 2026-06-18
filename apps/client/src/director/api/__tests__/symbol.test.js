import { describe, it, expect } from "vitest";
import { symbol } from "../symbol.js";

describe("symbol", () => {
  it("creates a symbol from a string", () => {
    expect(symbol("test")).toBe(Symbol.for("test"));
  });

  it("returns the same symbol for same string (global registry)", () => {
    expect(symbol("hello")).toBe(symbol("hello"));
  });

  it("returns different symbols for different strings", () => {
    expect(symbol("a")).not.toBe(symbol("b"));
  });

  it("is pure (no side effects)", () => {
    expect(symbol("test")).toBe(symbol("test"));
  });
});
