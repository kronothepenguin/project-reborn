import { describe, it, expect } from "vitest";
import { charToNum } from "../charToNum.js";

describe("charToNum", () => {
  it("returns 65 for uppercase A", () => {
    expect(charToNum("A")).toBe(65);
  });

  it("returns 97 for lowercase a", () => {
    expect(charToNum("a")).toBe(97);
  });

  it("returns 48 for digit 0", () => {
    expect(charToNum("0")).toBe(48);
  });

  it("uses first character only", () => {
    expect(charToNum("ABC")).toBe(65);
  });

  it("handles space character", () => {
    expect(charToNum(" ")).toBe(32);
  });

  it("is pure (no side effects)", () => {
    expect(charToNum("A")).toBe(charToNum("A"));
  });
});
