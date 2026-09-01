import { describe, it, expect } from "vitest";
import { list } from "../list.js";
import { List } from "../../index.js";

describe("list", () => {
  it("returns a List instance when called with no args", () => {
    const result = list();
    expect(result).toBeInstanceOf(List);
    expect(result.count).toBe(0);
  });

  it("returns a List instance with provided values", () => {
    const result = list(1, 2, 3);
    expect(result).toBeInstanceOf(List);
    expect(result.count).toBe(3);
    expect(result.getAt(1)).toBe(1);
    expect(result.getAt(2)).toBe(2);
    expect(result.getAt(3)).toBe(3);
  });

  it("creates a list with string values", () => {
    const result = list("Gee", "Kayne", "Ohashi");
    expect(result.count).toBe(3);
    expect(result.getAt(1)).toBe("Gee");
    expect(result.getAt(2)).toBe("Kayne");
    expect(result.getAt(3)).toBe("Ohashi");
  });

  it("creates a list with mixed value types", () => {
    const result = list(1, "two", 3.14, true);
    expect(result.count).toBe(4);
    expect(result.getAt(1)).toBe(1);
    expect(result.getAt(2)).toBe("two");
    expect(result.getAt(3)).toBe(3.14);
    expect(result.getAt(4)).toBe(true);
  });
});
