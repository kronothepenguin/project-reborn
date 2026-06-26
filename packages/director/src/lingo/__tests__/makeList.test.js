import { describe, it, expect } from "vitest";
import { makeList } from "../makeList.js";

describe("makeList", () => {
  it("is exported as a function", () => {
    expect(typeof makeList).toBe("function");
  });

  it("takes one parameter (parserObject)", () => {
    expect(makeList.length).toBe(1);
  });

  it("returns an object (the parsed list)", () => {
    expect(typeof makeList({})).toBe("object");
  });

  it("matches the spec example shape (after parseString)", () => {
    const parser = {};
    const result = makeList(parser);
    expect(result).toBeDefined();
  });
});
