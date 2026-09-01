import { describe, it, expect } from "vitest";
import { putInto, line, char, word } from "../../../api/index.js";

describe("putInto", () => {
  it("replaces the whole container when the target is a plain string", () => {
    expect(putInto("abc", "X")).toBe("X");
  });

  it("replaces a chunk target while leaving the rest intact (doc example)", () => {
    expect(putInto(line(2).of("a\rb"), "Y")).toBe("a\rY");
  });

  it("replaces the target word", () => {
    expect(putInto(word(2).of("fox dog cat"), "elk")).toBe("fox elk cat");
  });

  it("an empty whole-container becomes the inserted value", () => {
    expect(putInto("", "V")).toBe("V");
  });

  it("inserts as appropriate when the target chunk does not exist (append)", () => {
    expect(putInto(char(99).of("abc"), "X")).toBe("abcX");
  });

  it("stringifies a non-string value", () => {
    expect(putInto("abc", 5)).toBe("5");
    expect(putInto("abc", null)).toBe("");
  });
});