import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { word, wordRange } from "../word.js";

describe("word", () => {
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

  it("returns the word at the 1-based position with default space delimiter", () => {
    delete globalThis.the;
    expect(word(2, "hello world test")).toBe("world");
  });

  it("returns the first word at position 1", () => {
    expect(word(1, "hello world")).toBe("hello");
  });

  it("returns the last word at the count position", () => {
    expect(word(2, "hello world")).toBe("world");
  });

  it("returns empty string when position is below 1", () => {
    expect(word(0, "hello world")).toBe("");
  });

  it("returns empty string when position exceeds word count", () => {
    expect(word(10, "hello world")).toBe("");
  });

  it("returns the whole string when there is no space", () => {
    expect(word(1, "hello")).toBe("hello");
  });

  it("honors the.wordDelimiter when set", () => {
    globalThis.the = { wordDelimiter: "," };
    expect(word(2, "a,b,c")).toBe("b");
  });

  it("accepts an explicit delimiter override", () => {
    expect(word(2, "a,b,c", ",")).toBe("b");
  });

  it("returns empty string for non-string input", () => {
    expect(word(1, undefined)).toBe("");
  });
});

describe("wordRange", () => {
  it("returns joined words across a range with default space delimiter", () => {
    expect(wordRange(1, 2, "hello world test")).toBe("hello world");
  });

  it("returns joined words across a range with custom delimiter", () => {
    expect(wordRange(2, 3, "a,b,c,d", ",")).toBe("b,c");
  });

  it("returns single word when start equals end", () => {
    expect(wordRange(2, 2, "hello world test")).toBe("world");
  });

  it("clamps end to word count", () => {
    expect(wordRange(2, 100, "hello world test")).toBe("world test");
  });

  it("clamps start to 1 when below", () => {
    expect(wordRange(0, 2, "hello world test")).toBe("hello world");
  });

  it("returns empty string when end is before start", () => {
    expect(wordRange(3, 1, "hello world test")).toBe("");
  });
});
