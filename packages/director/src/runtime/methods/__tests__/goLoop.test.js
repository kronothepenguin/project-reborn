import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { goLoop } from "../goLoop.js";
import { _movie } from "../../singletons.js";

describe("goLoop", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_movie, "goLoop").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof goLoop).toBe("function");
  });

  it("takes no parameters", () => {
    expect(goLoop.length).toBe(0);
  });

  it("delegates to _movie.goLoop", () => {
    goLoop();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not throw on real MovieObject", () => {
    spy.mockRestore();
    expect(() => goLoop()).not.toThrow();
  });
});
