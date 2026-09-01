import { describe, it, expect } from "vitest";
import { char } from "../../../api/index.js";

describe("char chunk expression", () => {
  it("reads a single 1-based char", () => {
    expect(String(char(1).of("$9.00"))).toBe("$");
    expect(String(char(5).of("$9.00"))).toBe("0");
  });

  it("reads a range preserving the contained chars (doc example)", () => {
    expect(String(char(1).to(5).of("$9.00"))).toBe("$9.00");
    expect(String(char(1).to(1).of("$9.00"))).toBe("$");
  });

  it("returns the empty string for out-of-range positions", () => {
    expect(String(char(9).of("$9.00"))).toBe("");
    expect(String(char(0).of("abc"))).toBe("");
    expect(String(char(-1).of("abc"))).toBe("");
  });

  it("clamps range ends beyond the last char", () => {
    expect(String(char(1).to(99).of("hi"))).toBe("hi");
  });

  it("returns the empty string for an empty range (start > end)", () => {
    expect(String(char(3).to(2).of("abc"))).toBe("");
  });

  it("returns the empty string when start < 1 (C2)", () => {
    expect(String(char(0).to(2).of("abc"))).toBe("");
    expect(String(char(-2).to(3).of("abc"))).toBe("");
  });

  it("returns the empty string for empty or non-string containers", () => {
    expect(String(char(1).of(""))).toBe("");
    expect(String(char(1).of(null))).toBe("");
    expect(String(char(1).of(undefined))).toBe("");
    expect(String(char(1).of(42))).toBe("");
  });

  it("reads behave as strings in string contexts", () => {
    const c = char(1).of("abc");
    expect(typeof String(c)).toBe("string");
    expect(c.length).toBe(1);
    expect(`${c}`).toBe("a");
  });
});