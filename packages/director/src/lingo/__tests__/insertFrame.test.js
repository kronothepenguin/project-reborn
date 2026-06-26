import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { insertFrame } from "../insertFrame.js";
import { _movie } from "../../core/movie-ref.js";

describe("insertFrame", () => {
  let spy;

  beforeEach(() => {
    _movie._reset();
    _movie._setFrame(5);
    spy = vi.spyOn(_movie, "insertFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
    _movie._reset();
  });

  it("is exported as a function", () => {
    expect(typeof insertFrame).toBe("function");
  });

  it("takes no parameters", () => {
    expect(insertFrame.length).toBe(0);
  });

  it("delegates to _movie.insertFrame", () => {
    insertFrame();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not throw on real MovieRef", () => {
    spy.mockRestore();
    _movie._setFrame(1);
    expect(() => insertFrame()).not.toThrow();
  });
});
