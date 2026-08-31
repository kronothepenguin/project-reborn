import { describe, it, expect } from "vitest";
import { value } from "../value.js";

describe("value", () => {
  it("parses numeric string to number", () => {
    expect(value("42")).toBe(42);
  });

  it("parses decimal string to number", () => {
    expect(value("3.14")).toBe(3.14);
  });

  it("parses TRUE to boolean true", () => {
    expect(value("TRUE")).toBe(true);
  });

  it("parses FALSE to boolean false", () => {
    expect(value("FALSE")).toBe(false);
  });

  it("parses VOID to undefined", () => {
    expect(value("VOID")).toBe(undefined);
  });

  it("parses EMPTY to empty string", () => {
    expect(value("EMPTY")).toBe("");
  });

  it("returns unknown string unchanged", () => {
    expect(value("penny")).toBe("penny");
  });

  it("parses partial numeric prefix (Director behavior)", () => {
    expect(value("3 5")).toBe(3);
  });

  it("is pure (no side effects)", () => {
    expect(value("42")).toBe(value("42"));
  });
});
