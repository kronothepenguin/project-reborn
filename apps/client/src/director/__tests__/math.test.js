import { describe, it, expect } from "vitest";
import {
  abs,
  atan,
  cos,
  sin,
  sqrt,
  tan,
  log,
  max,
  min,
  power,
  random,
  list,
} from "../api.js";

describe("Director Math Functions", () => {
  describe("abs()", () => {
    it("returns absolute value for negative numbers", () => {
      expect(abs(-42)).toBe(42);
    });

    it("returns same value for positive numbers", () => {
      expect(abs(42)).toBe(42);
    });

    it("returns 0 for 0", () => {
      expect(abs(0)).toBe(0);
    });

    it("handles float values", () => {
      expect(abs(-3.14)).toBeCloseTo(3.14);
    });
  });

  describe("sqrt()", () => {
    it("returns square root of perfect squares", () => {
      expect(sqrt(16)).toBe(4);
      expect(sqrt(25)).toBe(5);
      expect(sqrt(100)).toBe(10);
    });

    it("handles zero", () => {
      expect(sqrt(0)).toBe(0);
    });

    it("handles non-perfect squares", () => {
      expect(sqrt(2)).toBeCloseTo(1.41421, 4);
    });
  });

  describe("max()", () => {
    it("returns larger of two arguments", () => {
      expect(max(5, 10)).toBe(10);
      expect(max(10, 5)).toBe(10);
    });

    it("handles negative numbers", () => {
      expect(max(-5, -10)).toBe(-5);
    });

    it("returns maximum value from list", () => {
      const l = list(3, 7, 2, 9, 1);
      expect(max(l)).toBe(9);
    });

    it("handles equal values", () => {
      expect(max(5, 5)).toBe(5);
    });
  });

  describe("min()", () => {
    it("returns smaller of two arguments", () => {
      expect(min(5, 10)).toBe(5);
      expect(min(10, 5)).toBe(5);
    });

    it("handles negative numbers", () => {
      expect(min(-5, -10)).toBe(-10);
    });

    it("returns minimum value from list", () => {
      const l = list(3, 7, 2, 9, 1);
      expect(min(l)).toBe(1);
    });

    it("handles equal values", () => {
      expect(min(5, 5)).toBe(5);
    });
  });

  describe("power()", () => {
    it("returns base raised to exponent", () => {
      expect(power(2, 8)).toBe(256);
      expect(power(3, 2)).toBe(9);
      expect(power(10, 3)).toBe(1000);
    });

    it("handles zero exponent", () => {
      expect(power(5, 0)).toBe(1);
    });

    it("handles exponent of 1", () => {
      expect(power(5, 1)).toBe(5);
    });

    it("handles fractional exponents", () => {
      expect(power(4, 0.5)).toBeCloseTo(2);
    });
  });

  describe("sin()", () => {
    it("returns sine of 0", () => {
      expect(sin(0)).toBe(0);
    });

    it("returns sine of PI/2", () => {
      expect(sin(Math.PI / 2)).toBeCloseTo(1);
    });

    it("returns sine of PI", () => {
      expect(sin(Math.PI)).toBeCloseTo(0);
    });
  });

  describe("cos()", () => {
    it("returns cosine of 0", () => {
      expect(cos(0)).toBe(1);
    });

    it("returns cosine of PI/2", () => {
      expect(cos(Math.PI / 2)).toBeCloseTo(0);
    });

    it("returns cosine of PI", () => {
      expect(cos(Math.PI)).toBeCloseTo(-1);
    });
  });

  describe("tan()", () => {
    it("returns tangent of 0", () => {
      expect(tan(0)).toBe(0);
    });

    it("returns tangent of PI/4", () => {
      expect(tan(Math.PI / 4)).toBeCloseTo(1);
    });
  });

  describe("atan()", () => {
    it("returns arctangent of 0", () => {
      expect(atan(0)).toBe(0);
    });

    it("returns arctangent of 1", () => {
      expect(atan(1)).toBeCloseTo(Math.PI / 4);
    });
  });

  describe("log()", () => {
    it("returns natural logarithm of e", () => {
      expect(log(Math.E)).toBeCloseTo(1);
    });

    it("returns natural logarithm of 1", () => {
      expect(log(1)).toBe(0);
    });

    it("returns natural logarithm of e^2", () => {
      expect(log(Math.E ** 2)).toBeCloseTo(2);
    });
  });

  describe("random()", () => {
    it("returns values in range 1 to maxInt", () => {
      for (let i = 0; i < 100; i++) {
        const result = random(10);
        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(10);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    it("returns 1 when maxInt is 1", () => {
      expect(random(1)).toBe(1);
    });
  });
});
