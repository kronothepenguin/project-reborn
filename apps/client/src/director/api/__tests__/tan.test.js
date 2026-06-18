import { describe, it, expect } from "vitest";
import { tan } from "../tan.js";

describe("tan", () => {
  it("returns tangent of 0", () => {
    expect(tan(0)).toBe(0);
  });

  it("handles pi/4", () => {
    expect(tan(Math.PI / 4)).toBeCloseTo(1, 10);
  });
});
