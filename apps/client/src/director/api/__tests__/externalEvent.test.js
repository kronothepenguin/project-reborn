import { describe, it, expect } from "vitest";
import { externalEvent } from "../externalEvent.js";

describe("externalEvent", () => {
  it("is exported as a function", () => {
    expect(typeof externalEvent).toBe("function");
  });

  it("takes one parameter (string)", () => {
    expect(externalEvent.length).toBe(1);
  });

  it("does not throw", () => {
    expect(() => externalEvent("MyFunction('a','b')")).not.toThrow();
  });

  it("returns undefined", () => {
    expect(externalEvent("test")).toBeUndefined();
  });
});
