import { describe, it, expect } from "vitest";
import { call } from "../call.js";

describe("call", () => {
  it("is exported as a function", () => {
    expect(typeof call).toBe("function");
  });

  it("invokes a handler on a script instance with a symbol name", () => {
    const instance = { name: "test", greet(me, msg) { return `hello ${msg}`; } };
    const result = call("greet", instance, "world");
    expect(result).toBe("hello world");
  });

  it("invokes a handler with a string name starting with #", () => {
    const instance = { bump(me, n, v) { return n + v; } };
    expect(call("#bump", instance, 2, 3)).toBe(5);
  });

  it("throws when the handler is not defined on a single script instance", () => {
    const instance = { name: "empty" };
    expect(() => call("#missing", instance)).toThrow(/not defined/);
  });

  it("does not throw when handler is missing from one of a list of scripts", () => {
    const a = { name: "a", greet() { return "a"; } };
    const b = { name: "b" };
    expect(() => call("#greet", [a, b])).not.toThrow();
  });

  it("returns an array of results when called with a list of scripts", () => {
    const a = { name: "a", ping() { return 1; } };
    const b = { name: "b", ping() { return 2; } };
    expect(call("#ping", [a, b])).toEqual([1, 2]);
  });

  it("passes the script instance as the first argument to handlers (Lingo 'me')", () => {
    let captured = null;
    const instance = { name: "self", check(me) { captured = me; return me; } };
    call("#check", instance);
    expect(captured).toBe(instance);
  });

  it("forwards multiple arguments to the handler", () => {
    const instance = { add(me, a, b, c) { return a + b + c; } };
    expect(call("#add", instance, 1, 2, 3)).toBe(6);
  });

  it("matches the spec example shape (bumpCounter with arg 2)", () => {
    const xref = { name: "behavior", bumpCounter(me, n) { return n * 10; } };
    expect(call("bumpCounter", xref, 2)).toBe(20);
  });
});
