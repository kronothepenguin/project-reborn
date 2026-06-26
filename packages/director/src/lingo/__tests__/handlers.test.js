import { describe, it, expect } from "vitest";
import { handlers } from "../handlers.js";

describe("handlers", () => {
  it("is exported as a function", () => {
    expect(typeof handlers).toBe("function");
  });

  it("returns a list of handler symbols", () => {
    const obj = { accelerate() {}, turn() {}, stop() {} };
    const result = handlers(obj);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);
  });

  it("returns each handler as a symbol", () => {
    const obj = { run() {} };
    const result = handlers(obj);
    expect(typeof result[0]).toBe("symbol");
  });

  it("returns an empty list for null", () => {
    expect(handlers(null)).toEqual([]);
  });

  it("includes ancestor handlers without duplication", () => {
    const obj = { run() {}, ancestor: { walk() {} } };
    const result = handlers(obj);
    expect(result.length).toBe(2);
  });

  it("matches the spec example shape (RedCar)", () => {
    const RedCar = { accelerate() {}, turn() {}, stop() {} };
    const result = handlers(RedCar);
    expect(result).toHaveLength(3);
  });
});
