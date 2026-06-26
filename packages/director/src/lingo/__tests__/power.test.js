import { describe, it, expect } from "vitest";
import { power } from "../power.js";

describe("power", () => {
  it("returns exponentiation", () => {
    expect(power(2, 8)).toBe(256);
  });

  it("handles zero exponent", () => {
    expect(power(5, 0)).toBe(1);
  });

  it("handles fractional exponent", () => {
    expect(power(9, 0.5)).toBe(3);
  });
});
