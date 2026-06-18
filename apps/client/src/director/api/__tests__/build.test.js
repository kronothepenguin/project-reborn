import { describe, it, expect } from "vitest";
import { build } from "../build.js";

describe("build", () => {
  it("is exported as a function", () => {
    expect(typeof build).toBe("function");
  });

  it("takes one parameter (modelResource)", () => {
    expect(build.length).toBe(1);
  });

  it("returns undefined", () => {
    expect(build({})).toBeUndefined();
  });

  it("does not throw", () => {
    expect(() => build({})).not.toThrow();
  });
});
