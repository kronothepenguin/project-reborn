import { describe, it, expect } from "vitest";
import { sin } from "../sin.js";

describe("sin", () => {
  it("returns sine of 0", () => {
    expect(sin(0)).toBe(0);
  });

  it("handles pi/2", () => {
    expect(sin(Math.PI / 2)).toBeCloseTo(1, 10);
  });
});
