import { describe, it, expect } from "vitest";
import { List, list } from "../../../api/index.js";

const documentedMembers = [
  "count",
  "add",
  "addAt",
  "append",
  "deleteAt",
  "deleteOne",
  "deleteProp",
  "duplicate",
  "getAt",
  "getOne",
  "getPos",
  "getLast",
  "setAt",
  "sort",
];

describe("List", () => {
  it("exposes exactly the documented prototype surface (FR-004)", () => {
    const protoMembers = Object.getOwnPropertyNames(List.prototype).filter(
      (p) => p !== "constructor" && p !== "Symbol(Symbol.iterator)"
    );
    expect(protoMembers.sort()).toEqual([...documentedMembers].sort());
  });

  it("tracks count over 1-based entries", () => {
    const l = new List(3, 1, 2);
    expect(l.count).toBe(3);
    expect(l.getAt(1)).toBe(3);
    expect(l.getAt(3)).toBe(2);
  });

  it("add() appends to an unsorted list", () => {
    const l = new List(3, 1, 2);
    l.add(1.5);
    expect(l.count).toBe(4);
    expect(l.getAt(4)).toBe(1.5);
  });

  it("sort() orders numbers before strings alphanumerically and sets sorted", () => {
    const l = new List("b", 2, 1, "a");
    l.sort();
    expect(l.sorted).toBe(true);
    expect(l.getAt(1)).toBe(1);
    expect(l.getAt(2)).toBe(2);
    expect(l.getAt(3)).toBe("a");
    expect(l.getAt(4)).toBe("b");
  });

  it("add() inserts into a sorted list at the proper position", () => {
    const l = new List(1, 4, 5);
    l.sort();
    l.add(2);
    expect(l.getAt(2)).toBe(2);
    expect(l.getAt(3)).toBe(4);
  });

  it("setAt() pads blanks with 0 beyond the end (D-2)", () => {
    const l = new List(1, 2);
    l.setAt(5, 99);
    expect(l.count).toBe(5);
    expect(l.getAt(3)).toBe(0);
    expect(l.getAt(4)).toBe(0);
    expect(l.getAt(5)).toBe(99);
  });

  it("deleteAt() is a no-op for positions < 1 or > count (D-3)", () => {
    const l = new List(1, 2, 3);
    l.deleteAt(0);
    l.deleteAt(99);
    l.deleteAt(-3);
    expect(l.count).toBe(3);
    expect(l.getAt(1)).toBe(1);
    expect(l.getAt(3)).toBe(3);
  });

  it("deleteAt() removes a valid 1-based position", () => {
    const l = new List(1, 2, 3);
    l.deleteAt(2);
    expect(l.count).toBe(2);
    expect(l.getAt(1)).toBe(1);
    expect(l.getAt(2)).toBe(3);
  });

  it("deleteOne() removes only the first occurrence", () => {
    const l = new List(1, 2, 1, 3);
    l.deleteOne(1);
    expect(l.count).toBe(3);
    expect(l.getAt(1)).toBe(2);
    expect(l.getAt(2)).toBe(1);
  });

  it("duplicate() returns an independent copy with nested lists deep-copied", () => {
    const inner = new List(1, 2);
    const l = new List(inner, 3);
    const d = l.duplicate();
    d.setAt(1, new List(9, 9));
    expect(l.getAt(1).getAt(1)).toBe(1);
    expect(l.getAt(2)).toBe(3);
    d.getAt(1).setAt(1, 5);
    expect(l.getAt(1).getAt(1)).toBe(1);
  });

  it("getLast() returns VOID (null) on an empty list (D-3)", () => {
    const l = new List();
    expect(l.getLast()).toBe(null);
  });

  it("getLast() returns the last value", () => {
    const l = new List(1, 2, 3);
    expect(l.getLast()).toBe(3);
  });

  it("getAt() throws on out-of-range reads (script error)", () => {
    const l = new List(1, 2);
    expect(() => l.getAt(0)).toThrow();
    expect(() => l.getAt(3)).toThrow();
    expect(() => l.getAt(-1)).toThrow();
  });

  it("getOne()/getPos() return 0 when the value is absent", () => {
    const l = new List(1, 2, 3);
    expect(l.getOne(99)).toBe(0);
    expect(l.getPos(99)).toBe(0);
  });

  it("getOne()/getPos() return the 1-based position of the first occurrence", () => {
    const l = new List(10, 20, 10);
    expect(l.getOne(10)).toBe(1);
    expect(l.getPos(20)).toBe(2);
  });

  describe("list() creator proxy (bracket/list syntax, amendment 2026-08-31)", () => {
    it("bracket read maps to getAt and throws out of range", () => {
      const l = list(1, 2, 3);
      expect(l[1]).toBe(1);
      expect(l[3]).toBe(3);
      expect(() => l[4]).toThrow();
      expect(() => l[0]).toThrow();
    });

    it("bracket write maps to setAt (pads beyond the end with 0)", () => {
      const l = list(1, 2);
      l[3] = 7;
      expect(l.count).toBe(3);
      expect(l.getAt(3)).toBe(7);
      l[5] = 9;
      expect(l.getAt(4)).toBe(0);
      expect(l.getAt(5)).toBe(9);
    });

    it("has operator respects 1-based membership", () => {
      const l = list(1, 2, 3);
      expect(1 in l).toBe(true);
      expect(3 in l).toBe(true);
      expect(4 in l).toBe(false);
    });
  });
});
