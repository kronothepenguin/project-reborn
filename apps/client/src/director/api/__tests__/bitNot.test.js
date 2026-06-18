import { describe, it, expect } from "vitest";
import { bitNot } from "../bitNot.js";

describe("bitNot", () => {
  it("inverts bits of 1 to -2 (example from docs)", () => {
    expect(bitNot(1)).toBe(-2);
  });

  it("inverts bits of 5 to -6 (~101 = ...111010)", () => {
    expect(bitNot(5)).toBe(-6);
  });

  it("inverts zero to -1", () => {
    expect(bitNot(0)).toBe(-1);
  });

  it("inverts -1 to 0", () => {
    expect(bitNot(-1)).toBe(0);
  });

  it("is pure (no side effects)", () => {
    expect(bitNot(5)).toBe(bitNot(5));
  });
});
