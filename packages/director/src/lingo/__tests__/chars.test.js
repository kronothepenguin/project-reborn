import { describe, it, expect } from "vitest";
import { chars } from "../chars.js";

describe("chars", () => {
  it("extracts a single character when start and end are equal", () => {
    expect(chars("Macromedia", 6, 6)).toBe("m");
  });

  it("extracts a substring across a range", () => {
    expect(chars("Macromedia", 6, 10)).toBe("media");
  });

  it("clamps to string length when end exceeds the string", () => {
    expect(chars("Macromedia", 6, 20)).toBe("media");
  });

  it("returns the full string when range covers it", () => {
    expect(chars("hello", 1, 5)).toBe("hello");
  });

  it("returns empty string when end is before start", () => {
    expect(chars("hello", 4, 2)).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(chars("", 1, 1)).toBe("");
  });

  it("is pure (no side effects)", () => {
    expect(chars("Macromedia", 6, 10)).toBe(chars("Macromedia", 6, 10));
  });
});
