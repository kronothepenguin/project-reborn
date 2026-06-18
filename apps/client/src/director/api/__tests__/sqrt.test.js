import { describe, it, expect } from "vitest";
import { sqrt } from "../sqrt.js";

describe("sqrt", () => {
  it("returns square root", () => {
    expect(sqrt(16)).toBe(4);
  });

  it("handles zero", () => {
    expect(sqrt(0)).toBe(0);
  });

  it("handles perfect squares", () => {
    expect(sqrt(25)).toBe(5);
  });
});
