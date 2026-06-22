import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { goPrevious } from "../goPrevious.js";
import { _movie } from "../../core/movie-ref.js";

describe("goPrevious", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_movie, "goPrevious").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof goPrevious).toBe("function");
  });

  it("takes no parameters", () => {
    expect(goPrevious.length).toBe(0);
  });

  it("delegates to _movie.goPrevious", () => {
    goPrevious();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
