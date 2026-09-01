import { describe, it, expect } from "vitest";
import { line, lineRange } from "../../../api/index.js";

describe("line chunk expression", () => {
  it("reads a single line delimited by carriage returns only", () => {
    expect(String(line(2).of("a\rb"))).toBe("b");
    expect(String(line(1).of("a\rb"))).toBe("a");
  });

  it("reads a range preserving the delimiters between included lines", () => {
    expect(String(line(1).to(2).of("a\rb"))).toBe("a\rb");
    expect(String(line(1).to(2).of("a\rb\rc"))).toBe("a\rb");
  });

  it("does not split on \\n (text wrapping is not a line break)", () => {
    expect(String(line(2).of("a\nb"))).toBe("");
    expect(String(line(1).to(2).of("a\nb"))).toBe("a\nb");
  });

  it("treats a trailing carriage return as a trailing empty line", () => {
    expect(String(line(2).of("a\r"))).toBe("");
    expect(String(line(1).to(2).of("a\r"))).toBe("a\r");
  });

  it("returns the empty string for out-of-range lines", () => {
    expect(String(line(9).of("a\rb"))).toBe("");
    expect(String(line(0).of("ab"))).toBe("");
  });

  it("lineRange is an alias for line(a).to(b)", () => {
    expect(String(lineRange(1, 2).of("a\rb"))).toBe(String(line(1).to(2).of("a\rb")));
  });
});