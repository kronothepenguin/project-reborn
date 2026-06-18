import { describe, it, expect } from "vitest";
import { char, charRange } from "../char.js";

describe("char", () => {
  it("returns the character at the 1-based position", () => {
    expect(char(3, "hello")).toBe("l");
  });

  it("returns the first character at position 1", () => {
    expect(char(1, "abc")).toBe("a");
  });

  it("returns the last character at the string length", () => {
    expect(char(5, "hello")).toBe("o");
  });

  it("returns empty string when position is below 1", () => {
    expect(char(0, "hello")).toBe("");
  });

  it("returns empty string when position exceeds string length", () => {
    expect(char(10, "hello")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(char(1, "")).toBe("");
  });

  it("returns empty string for non-string input", () => {
    expect(char(1, undefined)).toBe("");
  });
});

describe("charRange", () => {
  it("returns the substring across a 1-based range", () => {
    expect(charRange(2, 4, "hello")).toBe("ell");
  });

  it("returns single character when start equals end", () => {
    expect(charRange(3, 3, "hello")).toBe("l");
  });

  it("returns full string when range covers it", () => {
    expect(charRange(1, 5, "hello")).toBe("hello");
  });

  it("clamps end to string length", () => {
    expect(charRange(1, 100, "hi")).toBe("hi");
  });

  it("clamps start to 1 when below", () => {
    expect(charRange(0, 3, "hello")).toBe("hel");
  });

  it("returns empty string when end is before start", () => {
    expect(charRange(4, 2, "hello")).toBe("");
  });

  it("returns empty string for empty input", () => {
    expect(charRange(1, 3, "")).toBe("");
  });
});
