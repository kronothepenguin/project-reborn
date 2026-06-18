import { describe, it, expect } from "vitest";
import { listP } from "../listP.js";
import { list, propList } from "../../core/index.js";

describe("listP", () => {
  it("returns true for a List", () => {
    expect(listP(list(1, 2, 3))).toBe(true);
  });

  it("returns false for a PropList", () => {
    expect(listP(propList(Symbol.for("a"), 1))).toBe(false);
  });

  it("returns false for a plain array", () => {
    expect(listP([1, 2, 3])).toBe(false);
  });

  it("returns false for a number", () => {
    expect(listP(42)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(listP("hello")).toBe(false);
  });

  it("returns false for null", () => {
    expect(listP(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(listP(undefined)).toBe(false);
  });

  it("is pure (no side effects)", () => {
    const l = list(1, 2, 3);
    expect(listP(l)).toBe(listP(l));
  });
});
