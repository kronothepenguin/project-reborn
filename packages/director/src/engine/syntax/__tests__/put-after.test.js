import { describe, it, expect } from "vitest";
import { putAfter, word, char } from "../../../api/index.js";

describe("putAfter", () => {
  it("appends to the whole container when the target is a plain string", () => {
    expect(putAfter("abc", "X")).toBe("abcX");
  });

  it("inserts after a chunk target without replacing container content", () => {
    expect(putAfter(word(2).of("fox dog cat"), "X")).toBe("fox dogX cat");
  });

  it("inserts as appropriate when the target chunk does not exist (append)", () => {
    expect(putAfter(char(99).of("abc"), "X")).toBe("abcX");
    expect(putAfter(char(0).of("abc"), "X")).toBe("abcX");
  });

  it("stringifies a non-string value", () => {
    expect(putAfter("abc", 5)).toBe("abc5");
    expect(putAfter("abc", null)).toBe("abc");
    expect(putAfter("abc", true)).toBe("abctrue");
  });

  it("handles an empty container", () => {
    expect(putAfter("", "X")).toBe("X");
  });
});