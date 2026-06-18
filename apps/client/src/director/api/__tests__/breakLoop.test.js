import { describe, it, expect, vi } from "vitest";
import { breakLoop } from "../breakLoop.js";

describe("breakLoop", () => {
  it("is exported as a function", () => {
    expect(typeof breakLoop).toBe("function");
  });

  it("calls breakLoop on a sound channel ref", () => {
    const ch = { breakLoop: vi.fn() };
    breakLoop(ch);
    expect(ch.breakLoop).toHaveBeenCalledTimes(1);
  });

  it("does not throw on a numeric channel", () => {
    expect(() => breakLoop(1)).not.toThrow();
  });

  it("does not throw on null/undefined", () => {
    expect(() => breakLoop(null)).not.toThrow();
    expect(() => breakLoop()).not.toThrow();
  });

  it("matches the spec example shape (sound channel 2)", () => {
    const ch2 = { breakLoop: vi.fn() };
    breakLoop(ch2);
    expect(ch2.breakLoop).toHaveBeenCalled();
  });
});
