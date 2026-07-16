import { describe, it, expect } from "vitest";
import { min } from "../min.js";
import { list } from "../../types/list.js";

describe("min", () => {
  it("returns smaller of two values", () => {
    expect(min(5, 10)).toBe(5);
  });

  it("handles negative numbers", () => {
    expect(min(-5, -10)).toBe(-10);
  });

  it("with list returns minimum", () => {
    expect(min(list(3, 7, 2, 9))).toBe(2);
  });
});
