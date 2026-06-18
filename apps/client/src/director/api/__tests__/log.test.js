import { describe, it, expect } from "vitest";
import { log } from "../log.js";

describe("log", () => {
  it("returns natural log of e", () => {
    expect(log(Math.E)).toBeCloseTo(1, 10);
  });

  it("handles 1", () => {
    expect(log(1)).toBe(0);
  });
});
