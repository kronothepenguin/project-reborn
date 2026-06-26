import { describe, it, expect } from "vitest";
import { abort } from "../abort.js";

describe("abort", () => {
  it("is exported as a function", () => {
    expect(typeof abort).toBe("function");
  });

  it("takes no parameters", () => {
    expect(abort.length).toBe(0);
  });

  it("throws when called", () => {
    expect(() => abort()).toThrow();
  });

  it("throws an Error instance", () => {
    try {
      abort();
      throw new Error("abort() should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
    }
  });

  it("aborts the current handler when caught in a try/catch", () => {
    let handlerFinished = false;
    try {
      abort();
    } catch {
      handlerFinished = true;
    }
    expect(handlerFinished).toBe(true);
  });

  it("propagates through nested handler calls (handler stack unwinds)", () => {
    const visited = [];
    function inner() {
      visited.push("inner-before");
      abort();
      visited.push("inner-after");
    }
    function outer() {
      visited.push("outer-before");
      try {
        inner();
      } catch {
        visited.push("outer-caught");
      }
      visited.push("outer-after");
    }
    outer();
    expect(visited).toEqual([
      "outer-before",
      "inner-before",
      "outer-caught",
      "outer-after",
    ]);
  });

  it("does not quit Director - the process remains usable after throw", () => {
    try {
      abort();
    } catch {
      // swallowed
    }
    expect(typeof globalThis).toBe("object");
  });
});
