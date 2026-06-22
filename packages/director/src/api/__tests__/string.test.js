import { describe, it, expect } from "vitest";
import { string } from "../string.js";

describe("string", () => {
  it("converts integer to string", () => {
    expect(string(42)).toBe("42");
  });

  it("converts float to string", () => {
    expect(string(3.14)).toBe("3.14");
  });

  it("converts symbol to its description (no #)", () => {
    expect(string(Symbol.for("test"))).toBe("test");
  });

  it("returns string unchanged", () => {
    expect(string("hello")).toBe("hello");
  });

  it("converts boolean to string", () => {
    expect(string(true)).toBe("true");
  });

  it("is pure (no side effects)", () => {
    expect(string(42)).toBe(string(42));
  });
});
