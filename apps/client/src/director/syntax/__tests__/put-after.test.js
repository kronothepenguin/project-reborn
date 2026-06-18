import { describe, it, expect } from "vitest";
import { putAfter } from "../put-after.js";

describe("putAfter", () => {
  it("inserts after a single character at a 1-based position", () => {
    expect(putAfter("X", 3, 3, "hello")).toBe("helXlo");
  });

  it("inserts after the first character at position 1", () => {
    expect(putAfter("X", 1, 1, "hello")).toBe("hXello");
  });

  it("inserts after the last character", () => {
    expect(putAfter("X", 5, 5, "hello")).toBe("helloX");
  });

  it("inserts after a range of characters (uses chunk end)", () => {
    expect(putAfter("X", 2, 4, "hello")).toBe("hellXo");
  });

  it("inserts at the end of the string when range covers it", () => {
    expect(putAfter("X", 1, 5, "hello")).toBe("helloX");
  });

  it("clamps end to string length", () => {
    expect(putAfter("X", 1, 100, "hi")).toBe("hiX");
  });

  it("clamps start to 1 when below", () => {
    expect(putAfter("X", 0, 2, "hello")).toBe("heXllo");
  });

  it("returns str unchanged when end is before start", () => {
    expect(putAfter("X", 4, 2, "hello")).toBe("hello");
  });

  it("coerces non-string value to string", () => {
    expect(putAfter(42, 3, 3, "hello")).toBe("hel42lo");
  });

  it("inserts empty string when value is empty", () => {
    expect(putAfter("", 3, 3, "hello")).toBe("hello");
  });

  it("returns empty string for non-string input", () => {
    expect(putAfter("X", 1, 1, undefined)).toBe("");
  });
});
