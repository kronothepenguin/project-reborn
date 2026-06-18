import { describe, it, expect } from "vitest";
import { float } from "../float.js";

describe("float", () => {
  it("parses a decimal string", () => {
    expect(float("3.14")).toBe(3.14);
  });

  it("returns integer when given integer", () => {
    expect(float(42)).toBe(42);
  });

  it("converts integer to float", () => {
    expect(float("1")).toBe(1);
  });

  it("parses negative decimals", () => {
    expect(float("-2.5")).toBe(-2.5);
  });

  it("returns NaN for non-numeric string", () => {
    expect(Number.isNaN(float("abc"))).toBe(true);
  });

  it("is pure (no side effects)", () => {
    expect(float("3.14")).toBe(float("3.14"));
  });
});
