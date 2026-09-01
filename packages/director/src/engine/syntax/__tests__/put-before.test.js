import { describe, it, expect } from "vitest";
import { putBefore, word, char } from "../../../api/index.js";

describe("putBefore", () => {
  it("prepends to the whole container when the target is a plain string", () => {
    expect(putBefore("abc", "X")).toBe("Xabc");
  });

  it("inserts before a chunk target without replacing container content (doc example)", () => {
    expect(putBefore(word(2).of("fox dog cat"), "elk ")).toBe("fox elk dog cat");
  });

  it("inserts as appropriate when the target chunk does not exist (append)", () => {
    expect(putBefore(char(99).of("abc"), "X")).toBe("abcX");
  });

  it("stringifies a non-string value", () => {
    expect(putBefore("abc", 7)).toBe("7abc");
    expect(putBefore("abc", null)).toBe("abc");
  });

  it("handles an empty container", () => {
    expect(putBefore("", "X")).toBe("X");
  });
});