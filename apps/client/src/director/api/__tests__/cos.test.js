import { describe, it, expect } from "vitest";
import { cos } from "../cos.js";

describe("cos", () => {
  it("returns cosine of 0", () => {
    expect(cos(0)).toBe(1);
  });

  it("handles pi/2", () => {
    expect(cos(Math.PI / 2)).toBeCloseTo(0, 10);
  });
});
