import { describe, it, expect } from "vitest";
import { value } from "../value.js";

describe("value() — expression evaluation per docs (006 C7)", () => {
  it("returns the logical value of an arithmetic expression", () => {
    expect(value("3+4")).toBe(7);
    expect(value("2.5*2")).toBe(5);
    expect(value("10-3")).toBe(7);
    expect(value("20/4")).toBe(5);
    expect(value("(2+3)*4")).toBe(20);
    expect(value("-5")).toBe(-5);
  });

  it("returns the leading parsable portion up to the first syntax error", () => {
    expect(value("3 5")).toBe(3);
    expect(value("3+")).toBe(3);
  });

  it("returns VOID for words with no numerical value", () => {
    expect(value("penny")).toBeUndefined();
  });

  it("handles the documented constants", () => {
    expect(value("TRUE")).toBe(true);
    expect(value("FALSE")).toBe(false);
    expect(value("VOID")).toBeUndefined();
    expect(value("EMPTY")).toBe("");
  });

  it("converts a symbol string", () => {
    expect(value("#hop")).toBe(Symbol.for("hop"));
  });

  it("returns the quoted string", () => {
    expect(value('"hi"')).toBe("hi");
  });

  it("converts a list-formatted string into a live list", () => {
    const l = value("[1, 2, 3]");
    expect(Array.from(l)).toEqual([1, 2, 3]);
    const l2 = value('["cat", "dog"]');
    expect(Array.from(l2)).toEqual(["cat", "dog"]);
  });

  it("returns the empty string for an empty/empty-string input", () => {
    expect(value("")).toBe("");
    expect(value("   ")).toBe("");
  });
});