import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { flushInputEvents } from "../flushInputEvents.js";
import { _player } from "../../singletons.js";

describe("flushInputEvents", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_player, "flushInputEvents").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof flushInputEvents).toBe("function");
  });

  it("takes no parameters", () => {
    expect(flushInputEvents.length).toBe(0);
  });

  it("delegates to _player.flushInputEvents", () => {
    flushInputEvents();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not throw on real PlayerObject", () => {
    spy.mockRestore();
    expect(() => flushInputEvents()).not.toThrow();
  });

  it("matches the spec example shape (loop with flush)", () => {
    spy.mockRestore();
    expect(() => {
      for (let i = 1; i <= 10; i++) flushInputEvents();
    }).not.toThrow();
  });
});
