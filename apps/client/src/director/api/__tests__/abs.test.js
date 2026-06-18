import { describe, it, expect } from "vitest";
import { abs } from "../abs.js";

describe("abs", () => {
  it("returns absolute value for negative numbers", () => {
    expect(abs(-42)).toBe(42);
  });

  it("returns same value for positive numbers", () => {
    expect(abs(42)).toBe(42);
  });

  it("handles zero", () => {
    expect(abs(0)).toBe(0);
  });

  it("handles floats", () => {
    expect(abs(-3.14)).toBe(3.14);
  });
});
