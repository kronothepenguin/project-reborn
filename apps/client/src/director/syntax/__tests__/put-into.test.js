import { describe, it, expect } from "vitest";
import { putInto } from "../put-into.js";

describe("putInto", () => {
  it("replaces a single character at a 1-based position", () => {
    expect(putInto("X", 3, 3, "hello")).toBe("heXlo");
  });

  it("replaces the first character at position 1", () => {
    expect(putInto("H", 1, 1, "hello")).toBe("Hello");
  });

  it("replaces the last character at the string length", () => {
    expect(putInto("O", 5, 5, "hello")).toBe("hellO");
  });

  it("replaces a range of characters", () => {
    expect(putInto("X", 2, 4, "hello")).toBe("hXo");
  });

  it("replaces the full string when range covers it", () => {
    expect(putInto("world", 1, 5, "hello")).toBe("world");
  });

  it("clamps end to string length", () => {
    expect(putInto("X", 1, 100, "hi")).toBe("X");
  });

  it("clamps start to 1 when below", () => {
    expect(putInto("X", 0, 2, "hello")).toBe("Xllo");
  });

  it("returns str unchanged when end is before start", () => {
    expect(putInto("X", 4, 2, "hello")).toBe("hello");
  });

  it("coerces non-string value to string", () => {
    expect(putInto(42, 3, 3, "hello")).toBe("he42lo");
  });

  it("inserts empty string when value is empty", () => {
    expect(putInto("", 3, 4, "hello")).toBe("heo");
  });

  it("returns empty string for non-string input", () => {
    expect(putInto("X", 1, 1, undefined)).toBe("");
  });
});
