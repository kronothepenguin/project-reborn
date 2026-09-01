import { describe, it, expect } from "vitest";
import { window } from "../window.js";

describe("window (Lingo factory, v1 stub)", () => {
  it("is exported as a function", () => {
    expect(typeof window).toBe("function");
  });

  it("window('') === null", () => {
    expect(window("")).toBeNull();
  });

  it("window(undefined) === null", () => {
    expect(window(undefined)).toBeNull();
  });

  it("window(null) === null", () => {
    expect(window(null)).toBeNull();
  });

  it("window(123) === null (non-string)", () => {
    expect(window(123)).toBeNull();
  });

  it("window('Sun') === null (v1 stub — registry lookup deferred)", () => {
    expect(window("Sun")).toBeNull();
  });
});