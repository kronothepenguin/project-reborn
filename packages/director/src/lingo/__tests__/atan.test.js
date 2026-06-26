import { describe, it, expect } from "vitest";
import { atan } from "../atan.js";

describe("atan", () => {
  it("returns arctangent", () => {
    expect(atan(1)).toBeCloseTo(Math.PI / 4, 4);
  });

  it("handles zero", () => {
    expect(atan(0)).toBe(0);
  });
});
