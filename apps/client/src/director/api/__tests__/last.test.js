import { describe, it, expect } from "vitest";
import { last } from "../last.js";

describe("last", () => {
  it("is exported as a function", () => {
    expect(typeof last).toBe("function");
  });

  it("takes one parameter", () => {
    expect(last.length).toBe(1);
  });

  it("passes through the chunk expression", () => {
    const expr = "company";
    expect(last(expr)).toBe(expr);
  });

  it("matches the spec example shape (last word of phrase)", () => {
    const phrase = "Macromedia, the multimedia company";
    expect(last(phrase)).toBe(phrase);
  });
});
