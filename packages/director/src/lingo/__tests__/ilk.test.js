import { describe, it, expect } from "vitest";
import { ilk } from "../ilk.js";
import { list, propList } from "../../core/index.js";
import { color } from "../../core/color.js";
import { point } from "../../core/point.js";
import { rect } from "../../core/rect.js";

describe("ilk", () => {
  it("returns #integer for an integer", () => {
    expect(ilk(42)).toBe(Symbol.for("integer"));
  });

  it("returns #float for a float", () => {
    expect(ilk(3.14)).toBe(Symbol.for("float"));
  });

  it("returns #string for a string", () => {
    expect(ilk("hello")).toBe(Symbol.for("string"));
  });

  it("returns #list for a List", () => {
    expect(ilk(list(1, 2, 3))).toBe(Symbol.for("list"));
  });

  it("returns #propList for a PropList", () => {
    expect(ilk(propList(Symbol.for("a"), 1))).toBe(Symbol.for("propList"));
  });

  it("returns #symbol for a symbol", () => {
    expect(ilk(Symbol.for("test"))).toBe(Symbol.for("symbol"));
  });

  it("returns #void for undefined", () => {
    expect(ilk(undefined)).toBe(Symbol.for("void"));
  });

  it("returns #void for null", () => {
    expect(ilk(null)).toBe(Symbol.for("void"));
  });

  it("returns #color for a Color", () => {
    expect(ilk(color(255, 0, 0))).toBe(Symbol.for("color"));
  });

  it("returns #point for a Point", () => {
    expect(ilk(point(10, 20))).toBe(Symbol.for("point"));
  });

  it("returns #rect for a Rect", () => {
    expect(ilk(rect(0, 0, 100, 100))).toBe(Symbol.for("rect"));
  });

  it("returns #date for a Date", () => {
    expect(ilk(new Date())).toBe(Symbol.for("date"));
  });

  it("is pure (no side effects)", () => {
    expect(ilk(42)).toBe(ilk(42));
  });
});
