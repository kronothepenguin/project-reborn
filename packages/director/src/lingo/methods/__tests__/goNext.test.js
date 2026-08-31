import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { goNext } from "../goNext.js";
import { _movie } from "../../singletons.js";

describe("goNext", () => {
  let spy;

  beforeEach(() => {
    spy = vi.spyOn(_movie, "goNext").mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("is exported as a function", () => {
    expect(typeof goNext).toBe("function");
  });

  it("takes no parameters", () => {
    expect(goNext.length).toBe(0);
  });

  it("delegates to _movie.goNext", () => {
    goNext();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
