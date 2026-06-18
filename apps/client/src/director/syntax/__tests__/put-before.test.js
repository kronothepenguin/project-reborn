import { describe, it, expect } from "vitest";
import { putBefore } from "../put-before.js";

describe("putBefore", () => {
  it("inserts before a single character at a 1-based position", () => {
    expect(putBefore("X", 3, 3, "hello")).toBe("heXllo");
  });

  it("inserts before the first character at position 1", () => {
    expect(putBefore("H", 1, 1, "ello")).toBe("Hello");
  });

  it("inserts before the last character", () => {
    expect(putBefore("O", 4, 4, "hell")).toBe("helOl");
  });

  it("inserts before a range of characters (uses chunk start)", () => {
    expect(putBefore("X", 2, 4, "hello")).toBe("hXello");
  });

  it("inserts at the start of the string when range covers it", () => {
    expect(putBefore("X", 1, 5, "hello")).toBe("Xhello");
  });

  it("clamps end to string length", () => {
    expect(putBefore("X", 1, 100, "hi")).toBe("Xhi");
  });

  it("clamps start to 1 when below", () => {
    expect(putBefore("X", 0, 2, "hello")).toBe("Xhello");
  });

  it("returns str unchanged when end is before start", () => {
    expect(putBefore("X", 4, 2, "hello")).toBe("hello");
  });

  it("coerces non-string value to string", () => {
    expect(putBefore(42, 3, 3, "hello")).toBe("he42llo");
  });

  it("inserts empty string when value is empty", () => {
    expect(putBefore("", 3, 3, "hello")).toBe("hello");
  });

  it("returns empty string for non-string input", () => {
    expect(putBefore("X", 1, 1, undefined)).toBe("");
  });
});
