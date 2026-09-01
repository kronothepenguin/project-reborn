import { describe, it, expect } from "vitest";
import { PropList, propList } from "../../../api/index.js";

const documentedMembers = [
  "count",
  "addProp",
  "deleteAt",
  "deleteOne",
  "deleteProp",
  "duplicate",
  "findPos",
  "findPosNear",
  "getaProp",
  "getAt",
  "getOne",
  "getPos",
  "getProp",
  "getPropAt",
  "setaProp",
  "setAt",
  "sort",
];

describe("PropList", () => {
  it("exposes exactly the documented prototype surface (FR-004)", () => {
    const protoMembers = Object.getOwnPropertyNames(PropList.prototype).filter(
      (p) => p !== "constructor" && p !== "Symbol(Symbol.iterator)"
    );
    expect(protoMembers.sort()).toEqual([...documentedMembers].sort());
  });

  it("addProp() appends to an unsorted list", () => {
    const pl = new PropList("a", 1, "b", 2);
    pl.addProp("c", 3);
    expect(pl.count).toBe(3);
    expect(pl.getaProp("c")).toBe(3);
  });

  it("addProp() on an existing property creates a duplicate", () => {
    const pl = new PropList("a", 1, "b", 2);
    pl.addProp("a", 10);
    expect(pl.count).toBe(3);
    expect(pl.getaProp("a")).toBe(1);
  });

  it("getaProp() returns VOID (null) for a missing property", () => {
    const pl = new PropList("a", 1);
    expect(pl.getaProp("zzz")).toBe(null);
    expect(pl.getaProp(Symbol.for("zzz"))).toBe(null);
  });

  it("findPos() returns VOID (null) for a missing property", () => {
    const pl = new PropList("a", 1);
    expect(pl.findPos("zzz")).toBe(null);
  });

  it("getProp() throws for a missing property", () => {
    const pl = new PropList("a", 1);
    expect(() => pl.getProp("zzz")).toThrow();
  });

  it("getPropAt() throws for an absent index", () => {
    const pl = new PropList("a", 1);
    expect(() => pl.getPropAt(5)).toThrow();
  });

  it("setaProp() replaces an existing property", () => {
    const pl = new PropList("a", 1, "b", 2);
    pl.setaProp("a", 99);
    expect(pl.getaProp("a")).toBe(99);
    expect(pl.count).toBe(2);
  });

  it("setaProp() adds a new property when absent", () => {
    const pl = new PropList("a", 1);
    pl.setaProp("new", 7);
    expect(pl.getaProp("new")).toBe(7);
  });

  it("setAt() with position > count throws (script error)", () => {
    const pl = new PropList("a", 1);
    expect(() => pl.setAt(3, 9)).toThrow();
  });

  it("getAt() throws on out-of-range position", () => {
    const pl = new PropList("a", 1);
    expect(() => pl.getAt(5)).toThrow();
    expect(() => pl.getAt(0)).toThrow();
  });

  it("deleteProp() deletes only the first entry with that property name", () => {
    const pl = new PropList("a", 1, "a", 2, "b", 3);
    pl.deleteProp("a");
    expect(pl.count).toBe(2);
    expect(pl.getaProp("a")).toBe(2);
    expect(pl.getOne(2)).toBe("a");
  });

  it("deleteOne() deletes the entry whose VALUE matches (property and value)", () => {
    const pl = new PropList("a", 1, "b", 2);
    pl.deleteOne(1);
    expect(pl.count).toBe(1);
    expect(pl.getOne(1)).toBe(0);
    expect(pl.getaProp("b")).toBe(2);
  });

  it("getOne() returns the PROPERTY associated with the first matching value", () => {
    const pl = new PropList("a", 1, "b", 2, "c", 1);
    expect(pl.getOne(1)).toBe("a");
    expect(pl.getOne(99)).toBe(0);
  });

  it("getPos() returns the 1-based position or 0", () => {
    const pl = new PropList("a", 1, "b", 2);
    expect(pl.getPos(2)).toBe(2);
    expect(pl.getPos(99)).toBe(0);
  });

  it("sort() sorts alphabetically by property names and sets sorted", () => {
    const pl = new PropList("b", 2, "a", 1, "c", 3);
    pl.sort();
    expect(pl.sorted).toBe(true);
    expect(pl.getPropAt(1)).toBe("a");
    expect(pl.getPropAt(2)).toBe("b");
    expect(pl.getPropAt(3)).toBe("c");
  });

  describe("propList() creator proxy (bracket/list syntax, amendment 2026-08-31)", () => {
    it("bracket read of an existing property returns the value", () => {
      const pl = propList("a", 1, "b", 2);
      expect(pl["a"]).toBe(1);
      expect(pl[Symbol.for("b")]).toBe(2);
    });

    it("bracket read of a missing property throws (script error)", () => {
      const pl = propList("a", 1);
      expect(() => pl["zzz"]).toThrow();
      expect(() => pl[Symbol.for("zzz")]).toThrow();
    });

    it("class members still resolve before property lookup", () => {
      const pl = propList("count", 5, "a", 1);
      expect(pl.count).toBe(2);
      expect(pl.getaProp("count")).toBe(5);
    });

    it("bracket write of a missing property adds it", () => {
      const pl = propList("a", 1);
      pl["zzz"] = 5;
      expect(pl.getaProp("zzz")).toBe(5);
      pl[Symbol.for("www")] = 6;
      expect(pl.getaProp(Symbol.for("www"))).toBe(6);
    });

    it("bracket write of an existing property replaces it", () => {
      const pl = propList("a", 1);
      pl["a"] = 9;
      expect(pl.getaProp("a")).toBe(9);
    });
  });
});
