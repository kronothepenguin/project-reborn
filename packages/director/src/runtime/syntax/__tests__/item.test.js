import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { item, itemRange } from "../item.js";

describe("item", () => {
  let savedThe;

  beforeEach(() => {
    savedThe = globalThis.the;
  });

  afterEach(() => {
    if (savedThe === undefined) {
      delete globalThis.the;
    } else {
      globalThis.the = savedThe;
    }
  });

  it("returns the item at the 1-based position with default comma delimiter", () => {
    delete globalThis.the;
    expect(item(2, "a,b,c")).toBe("b");
  });

  it("returns the first item at position 1", () => {
    delete globalThis.the;
    expect(item(1, "a,b,c")).toBe("a");
  });

  it("returns the last item at the count position", () => {
    delete globalThis.the;
    expect(item(3, "a,b,c")).toBe("c");
  });

  it("uses the.itemDelimiter when set", () => {
    globalThis.the = { itemDelimiter: ";" };
    expect(item(2, "a;b;c")).toBe("b");
  });

  it("falls back to comma when the.itemDelimiter is empty", () => {
    globalThis.the = { itemDelimiter: "" };
    expect(item(2, "a,b,c")).toBe("b");
  });

  it("returns empty string when position is below 1", () => {
    expect(item(0, "a,b,c")).toBe("");
  });

  it("returns empty string when position exceeds item count", () => {
    expect(item(10, "a,b,c")).toBe("");
  });

  it("returns the whole string when there is no delimiter", () => {
    expect(item(1, "abc")).toBe("abc");
  });

  it("accepts an explicit delimiter override", () => {
    expect(item(2, "a|b|c", "|")).toBe("b");
  });

  it("returns empty string for non-string input", () => {
    expect(item(1, undefined)).toBe("");
  });
});

describe("itemRange", () => {
  it("returns joined items across a range with default delimiter", () => {
    expect(itemRange(1, 2, "a,b,c,d")).toBe("a,b");
  });

  it("returns joined items across a range with custom delimiter", () => {
    expect(itemRange(2, 3, "a;b;c;d", ";")).toBe("b;c");
  });

  it("returns single item when start equals end", () => {
    expect(itemRange(2, 2, "a,b,c")).toBe("b");
  });

  it("clamps end to item count", () => {
    expect(itemRange(2, 100, "a,b,c")).toBe("b,c");
  });

  it("clamps start to 1 when below", () => {
    expect(itemRange(0, 2, "a,b,c")).toBe("a,b");
  });

  it("returns empty string when end is before start", () => {
    expect(itemRange(3, 1, "a,b,c")).toBe("");
  });
});
