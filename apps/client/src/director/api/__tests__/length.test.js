import { describe, it, expect } from "vitest";
import { length } from "../length.js";

describe("length", () => {
  it("returns the number of characters in a string", () => {
    expect(length("hello")).toBe(5);
  });

  it("returns 10 for concatenated strings", () => {
    expect(length("Macro" + "media")).toBe(10);
  });

  it("returns 0 for an empty string", () => {
    expect(length("")).toBe(0);
  });

  it("counts spaces and control characters", () => {
    expect(length("a b\tc\n")).toBe(6);
  });

  it("is pure (no side effects)", () => {
    expect(length("hello")).toBe(length("hello"));
  });
});
