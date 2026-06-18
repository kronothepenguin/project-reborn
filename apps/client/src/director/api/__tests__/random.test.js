import { describe, it, expect } from "vitest";
import { random } from "../random.js";

describe("random", () => {
  it("returns number in range 1 to maxValue", () => {
    for (let i = 0; i < 100; i++) {
      const r = random(10);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(10);
      expect(Number.isInteger(r)).toBe(true);
    }
  });

  it("with 1 returns 1", () => {
    expect(random(1)).toBe(1);
  });
});
