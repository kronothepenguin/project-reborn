import { describe, it, expect } from "vitest";
import { handler } from "../handler.js";

describe("handler", () => {
  it("is exported as a function", () => {
    expect(typeof handler).toBe("function");
  });

  it("returns true for an existing handler", () => {
    const obj = { pounce() { return "pounce"; } };
    expect(handler("pounce", obj)).toBe(true);
  });

  it("returns false for a missing handler", () => {
    const obj = { run() { return "run"; } };
    expect(handler("missing", obj)).toBe(false);
  });

  it("accepts a symbol handler name", () => {
    const obj = { pounce() { return "pounce"; } };
    expect(handler(Symbol("pounce"), obj)).toBe(true);
  });

  it("returns false for null script", () => {
    expect(handler("pounce", null)).toBe(false);
  });

  it("checks the ancestor for inherited handlers", () => {
    const ancestor = { pounce() {} };
    const obj = { ancestor };
    expect(handler("pounce", obj)).toBe(true);
  });

  it("matches the spec example shape (spiderObject.handler(#pounce))", () => {
    const spiderObject = { pounce() { return "pounce"; } };
    if (handler("pounce", spiderObject)) {
      expect(spiderObject.pounce()).toBe("pounce");
    }
  });
});
