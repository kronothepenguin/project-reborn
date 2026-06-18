import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { line, lineRange } from "../line.js";

describe("line", () => {
  let savedThe;

  beforeEach(() => {
    savedThe = globalThis.the;
  });

  afterEach(() => {
    if (savedThe === undefined) {
      delete globalThis.the;
    } else {
      globalThis.the = savedThe;
    }
  });

  it("returns the line at the 1-based position", () => {
    expect(line(2, "a\nb\nc")).toBe("b");
  });

  it("returns the first line at position 1", () => {
    expect(line(1, "a\nb\nc")).toBe("a");
  });

  it("returns the last line at the count position", () => {
    expect(line(3, "a\nb\nc")).toBe("c");
  });

  it("returns empty string when position is below 1", () => {
    expect(line(0, "a\nb\nc")).toBe("");
  });

  it("returns empty string when position exceeds line count", () => {
    expect(line(10, "a\nb\nc")).toBe("");
  });

  it("returns the whole string when there is no line break", () => {
    expect(line(1, "abc")).toBe("abc");
  });

  it("honors the.lineDelimiter when set", () => {
    globalThis.the = { lineDelimiter: "|" };
    expect(line(2, "a|b|c")).toBe("b");
  });

  it("accepts an explicit delimiter override", () => {
    expect(line(2, "a|b|c", "|")).toBe("b");
  });

  it("returns empty string for non-string input", () => {
    expect(line(1, undefined)).toBe("");
  });
});

describe("lineRange", () => {
  it("returns joined lines across a range", () => {
    expect(lineRange(1, 2, "a\nb\nc")).toBe("a\nb");
  });

  it("returns single line when start equals end", () => {
    expect(lineRange(2, 2, "a\nb\nc")).toBe("b");
  });

  it("clamps end to line count", () => {
    expect(lineRange(2, 100, "a\nb\nc")).toBe("b\nc");
  });

  it("clamps start to 1 when below", () => {
    expect(lineRange(0, 2, "a\nb\nc")).toBe("a\nb");
  });

  it("returns empty string when end is before start", () => {
    expect(lineRange(3, 1, "a\nb\nc")).toBe("");
  });
});
