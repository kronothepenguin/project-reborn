import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { marker } from "../marker.js";
import { _movie } from "../../singletons.js";

describe("marker", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_movie, "marker").mockImplementation(() => 42);
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof marker).toBe("function");
  });

  it("takes one parameter", () => {
    expect(marker.length).toBe(1);
  });

  it("delegates to _movie.marker with integer", () => {
    marker(1);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it("delegates to _movie.marker with string", () => {
    marker("intro");
    expect(spy).toHaveBeenCalledWith("intro");
  });

  it("matches the spec example shape (next marker)", () => {
    expect(marker(1)).toBe(42);
  });
});
