import { describe, it, expect } from "vitest";
import { callAncestor } from "../callAncestor.js";

describe("callAncestor", () => {
  it("is exported as a function", () => {
    expect(typeof callAncestor).toBe("function");
  });

  it("invokes a handler on the ancestor, not the primary script", () => {
    const ancestor = { name: "Animal", run(me) { return "ancestor run"; } };
    const child = { name: "Man", ancestor, run(me) { return "child run"; } };
    expect(callAncestor("#run", child)).toBe("ancestor run");
  });

  it("passes extra args through to the ancestor handler", () => {
    const ancestor = { walk(me, count) { return `Animal walking with ${count} legs`; } };
    const child = { ancestor };
    expect(callAncestor("#walk", child, 2)).toBe("Animal walking with 2 legs");
  });

  it("throws when ancestor handler is missing on a single instance", () => {
    const child = { name: "lonely" };
    expect(() => callAncestor("#missing", child)).toThrow(/Ancestor/);
  });

  it("does not throw when ancestor is missing for items in a list", () => {
    const a = { ancestor: { ping() { return 1; } } };
    const b = { name: "noancestor" };
    expect(() => callAncestor("#ping", [a, b])).not.toThrow();
  });

  it("matches the spec example shape (Man/Animal inheritance)", () => {
    const ancestor = { legCount: 2, run(me) { return `Animal running with ${me.legCount} legs`; } };
    const man = { ancestor, run(me) { return "Man running"; } };
    expect(callAncestor("run", man)).toBe("Animal running with 2 legs");
  });
});
