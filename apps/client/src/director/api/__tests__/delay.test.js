import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { delay } from "../delay.js";
import { _movie } from "../../core/movie-ref.js";

describe("delay", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_movie, "delay").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof delay).toBe("function");
  });

  it("takes one parameter (intTicks)", () => {
    expect(delay.length).toBe(1);
  });

  it("delegates to _movie.delay with the given ticks", () => {
    delay(120);
    expect(spy).toHaveBeenCalledWith(120);
  });

  it("matches the spec example shape (2*60 ticks delay)", () => {
    delay(2 * 60);
    expect(spy).toHaveBeenCalledWith(120);
  });
});
