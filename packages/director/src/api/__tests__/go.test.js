import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { go } from "../go.js";
import { _movie } from "../../core/movie-ref.js";

describe("go", () => {
  let goSpy;

  beforeEach(() => {
    _movie._reset();
    goSpy = vi.spyOn(_movie, "go").mockImplementation(() => {});
  });

  afterEach(() => {
    goSpy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof go).toBe("function");
  });

  it("takes two parameters (frameNameOrNum, movieName)", () => {
    expect(go.length).toBe(2);
  });

  it("delegates to _movie.go with a frame number", () => {
    go(5);
    expect(goSpy).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith(5, undefined);
  });

  it("delegates to _movie.go with a frame marker label", () => {
    go("intro");
    expect(goSpy).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith("intro", undefined);
  });

  it("passes both frameNameOrNum and movieName through unchanged", () => {
    go("Memory", "Noh Tale to Tell");
    expect(goSpy).toHaveBeenCalledTimes(1);
    expect(goSpy).toHaveBeenCalledWith("Memory", "Noh Tale to Tell");
  });

  it("does not throw when _movie.go runs (real MovieRef path)", () => {
    goSpy.mockRestore();
    expect(() => go(1)).not.toThrow();
  });

  it("propagates an existing _movie.go result/error", () => {
    goSpy.mockImplementation(() => {
      throw new Error("movie load failure");
    });
    expect(() => go(1)).toThrow("movie load failure");
  });

  it("matches the spec example shape (_movie.go marker label)", () => {
    goSpy.mockRestore();
    _movie.go(1);
    _movie.go("start");
    expect(_movie.frame).toBe(1);
  });
});
