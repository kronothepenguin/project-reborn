import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { halt } from "../halt.js";
import { _movie } from "../../singletons.js";

describe("halt", () => {
  let haltSpy;

  beforeEach(() => {
    _movie._reset();
    haltSpy = vi.spyOn(_movie, "halt").mockImplementation(() => {});
  });

  afterEach(() => {
    haltSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof halt).toBe("function");
  });

  it("takes no parameters", () => {
    expect(halt.length).toBe(0);
  });

  it("delegates to _movie.halt", () => {
    halt();
    expect(haltSpy).toHaveBeenCalledTimes(1);
    expect(haltSpy).toHaveBeenCalledWith();
  });

  it("does not throw on the real MovieObject path", () => {
    haltSpy.mockRestore();
    expect(() => halt()).not.toThrow();
  });

  it("propagates errors from _movie.halt", () => {
    haltSpy.mockImplementation(() => {
      throw new Error("halt failure");
    });
    expect(() => halt()).toThrow("halt failure");
  });

  it("returns undefined", () => {
    expect(halt()).toBeUndefined();
  });

  it("matches the spec example shape (called when freeBytes < 50K)", () => {
    haltSpy.mockRestore();
    const freeBytes = 40 * 1024;
    if (freeBytes < 50 * 1024) {
      expect(() => halt()).not.toThrow();
    }
  });
});
