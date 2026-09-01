import { describe, it, expect } from "vitest";
import { word, wordRange } from "../../../api/index.js";

describe("word chunk expression", () => {
  it("reads a single word between spaces", () => {
    expect(String(word(2).of("fox dog cat"))).toBe("dog");
    expect(String(word(1).of("fox dog cat"))).toBe("fox");
  });

  it("reads a range preserving the spaces between included words", () => {
    expect(String(word(1).to(3).of("fox dog cat"))).toBe("fox dog cat");
  });

  it("returns the empty string for out-of-range words (doc example)", () => {
    expect(String(word(5).of("fox elk dog cat"))).toBe("");
  });

  it("treats any non-visible character as a space (Tab, CR)", () => {
    expect(String(word(2).of("a\tb"))).toBe("b");
    expect(String(word(2).of("a\rb"))).toBe("b");
    expect(String(word(1).to(2).of("a\tb"))).toBe("a\tb");
  });

  it("treats consecutive delimiters as empty words", () => {
    expect(String(word(2).of("a  b"))).toBe("");
    expect(String(word(3).of("a  b"))).toBe("b");
  });

  it("returns the empty string for an empty or non-string container", () => {
    expect(String(word(1).of(""))).toBe("");
    expect(String(word(1).of(7))).toBe("");
  });

  it("wordRange is an alias for word(a).to(b)", () => {
    expect(String(wordRange(1, 2).of("a b c"))).toBe(String(word(1).to(2).of("a b c")));
  });
});