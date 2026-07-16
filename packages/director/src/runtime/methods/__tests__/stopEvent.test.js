import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { stopEvent } from "../stopEvent.js";
import { _movie } from "../../singletons.js";

describe("stopEvent", () => {
  let stopEventSpy;

  beforeEach(() => {
    _movie._reset();
    stopEventSpy = vi.spyOn(_movie, "stopEvent").mockImplementation(() => {});
  });

  afterEach(() => {
    stopEventSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof stopEvent).toBe("function");
  });

  it("takes no parameters", () => {
    expect(stopEvent.length).toBe(0);
  });

  it("delegates to _movie.stopEvent", () => {
    stopEvent();
    expect(stopEventSpy).toHaveBeenCalledTimes(1);
    expect(stopEventSpy).toHaveBeenCalledWith();
  });

  it("does not throw on the real MovieObject path", () => {
    stopEventSpy.mockRestore();
    expect(() => stopEvent()).not.toThrow();
  });

  it("propagates errors from _movie.stopEvent", () => {
    stopEventSpy.mockImplementation(() => {
      throw new Error("stopEvent failure");
    });
    expect(() => stopEvent()).toThrow("stopEvent failure");
  });

  it("returns undefined", () => {
    expect(stopEvent()).toBeUndefined();
  });

  it("applies only to the current event (calling it twice is independent)", () => {
    stopEventSpy.mockClear();
    stopEvent();
    stopEvent();
    expect(stopEventSpy).toHaveBeenCalledTimes(2);
  });

  it("matches the spec example shape (mouseUp handler guard)", () => {
    stopEventSpy.mockRestore();
    let _global = { grandTotal: 500 };
    function mouseUp() {
      if (_global.grandTotal === 500) {
        expect(() => stopEvent()).not.toThrow();
      }
    }
    mouseUp();
  });
});
