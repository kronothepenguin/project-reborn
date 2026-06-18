import { describe, it, expect } from "vitest";
import { findEmpty } from "../findEmpty.js";

describe("findEmpty", () => {
  it("is exported as a function", () => {
    expect(typeof findEmpty).toBe("function");
  });

  it("takes one optional parameter", () => {
    expect(findEmpty.length).toBe(1);
  });

  it("returns a number", () => {
    expect(typeof findEmpty()).toBe("number");
  });

  it("does not throw on a member ref", () => {
    expect(() => findEmpty({ number: 100 })).not.toThrow();
  });
});
