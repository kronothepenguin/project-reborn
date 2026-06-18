import { describe, it, expect } from "vitest";
import { objectP } from "../objectP.js";

describe("objectP", () => {
  it("returns true for a plain object", () => {
    expect(objectP({})).toBe(true);
  });

  it("returns false for a number", () => {
    expect(objectP(42)).toBe(false);
  });

  it("returns false for a string", () => {
    expect(objectP("hello")).toBe(false);
  });

  it("returns false for null", () => {
    expect(objectP(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(objectP(undefined)).toBe(false);
  });

  it("returns false for booleans", () => {
    expect(objectP(true)).toBe(false);
  });

  it("returns true for an array", () => {
    expect(objectP([1, 2, 3])).toBe(true);
  });

  it("returns true for a function", () => {
    expect(objectP(() => {})).toBe(true);
  });

  it("is pure (no side effects)", () => {
    const obj = {};
    expect(objectP(obj)).toBe(objectP(obj));
  });
});
