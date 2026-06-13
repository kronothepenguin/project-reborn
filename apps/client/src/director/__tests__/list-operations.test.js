import { describe, it, expect } from "vitest";
import {
  list,
  getAt,
} from "../api.js";

describe("Director List Operations", () => {
  describe("list()", () => {
    it("creates list with values", () => {
      const l = list(1, 2, 3);
      expect(l.count).toBe(3);
    });

    it("creates empty list", () => {
      const l = list();
      expect(l.count).toBe(0);
    });

    it("creates list with mixed types", () => {
      const l = list(1, "two", true, null);
      expect(l.count).toBe(4);
    });
  });

  describe("getAt()", () => {
    it("returns item at 1-indexed position", () => {
      const l = list(10, 20, 30);
      expect(getAt(l, 1)).toBe(10);
      expect(getAt(l, 2)).toBe(20);
      expect(getAt(l, 3)).toBe(30);
    });

    it("throws error for out of bounds (Director MX 2004: script error occurs)", () => {
      const l = list(10, 20, 30);
      expect(() => getAt(l, 0)).toThrow();
      expect(() => getAt(l, 4)).toThrow();
    });
  });

  // Note: union() for lists does NOT exist in Director MX 2004
  // Director MX 2004 union() is only for rects: union(rect1, rect2)
  // TODO: Remove union() from api.js or implement rect union

  // Note: makeSubList() does NOT exist in Director MX 2004 for lists
  // Director MX 2004 makeSubList() is only for XML Parser objects
  // TODO: Remove makeSubList() from api.js

  describe("List class methods", () => {
    describe("add()", () => {
      it("appends value to list", () => {
        const l = list(1, 2);
        l.add(3);
        expect(l.count).toBe(3);
        expect(l[3]).toBe(3);
      });
    });

    describe("addAt()", () => {
      // Director MX 2004: "adds a value at a specified position in the list"
      // Example: bids.addAt(4,8) on [3, 2, 4, 5, 6, 7] → [3, 2, 4, 8, 5, 6, 7]
      it("inserts value at position (Director MX 2004 example)", () => {
        const bids = list(3, 2, 4, 5, 6, 7);
        bids.addAt(4, 8);
        expect(bids.count).toBe(7);
        expect(bids[1]).toBe(3);
        expect(bids[2]).toBe(2);
        expect(bids[3]).toBe(4);
        expect(bids[4]).toBe(8);
        expect(bids[5]).toBe(5);
        expect(bids[6]).toBe(6);
        expect(bids[7]).toBe(7);
      });
    });

    describe("deleteAt()", () => {
      // Director MX 2004: "deletes an item from a linear or property list"
      // Example: designers.deleteAt(2) on [gee, kayne, ohashi] → [gee, ohashi]
      it("removes item at position (Director MX 2004 example)", () => {
        const designers = list("gee", "kayne", "ohashi");
        designers.deleteAt(2);
        expect(designers.count).toBe(2);
        expect(designers[1]).toBe("gee");
        expect(designers[2]).toBe("ohashi");
      });
    });

    describe("deleteOne()", () => {
      it("removes first occurrence of value", () => {
        const l = list(1, 2, 3, 2);
        l.deleteOne(2);
        expect(l.count).toBe(3);
        expect(l[1]).toBe(1);
        expect(l[2]).toBe(3);
        expect(l[3]).toBe(2);
      });

      it("does nothing if value not found", () => {
        const l = list(1, 2, 3);
        l.deleteOne(5);
        expect(l.count).toBe(3);
      });
    });

    describe("duplicate()", () => {
      // Director MX 2004: "returns a copy of a list and copies nested lists"
      it("creates shallow copy", () => {
        const l = list(1, 2, 3);
        const copy = l.duplicate();
        expect(copy.count).toBe(3);
        expect(copy[1]).toBe(1);
        expect(copy[2]).toBe(2);
        expect(copy[3]).toBe(3);
        expect(copy).not.toBe(l);
      });
    });

    describe("getOne() / getPos()", () => {
      // Director MX 2004: "identifies the position (linear list) or property (property list) associated with a value"
      // "returns the result 0 when the specified value is not in the list"
      it("returns position of value (1-indexed)", () => {
        const l = list(10, 20, 30);
        expect(l.getOne(20)).toBe(2);
        expect(l.getPos(20)).toBe(2);
      });

      it("returns 0 if not found (Director MX 2004)", () => {
        const l = list(10, 20, 30);
        expect(l.getOne(50)).toBe(0);
      });
    });

    describe("setAt()", () => {
      // Director MX 2004: "replaces the item specified by orderNumber with the value"
      it("replaces item at position (Director MX 2004 example)", () => {
        const vNumbers = list(12, 34, 6, 7, 45);
        vNumbers.setAt(4, 10);
        expect(vNumbers[1]).toBe(12);
        expect(vNumbers[2]).toBe(34);
        expect(vNumbers[3]).toBe(6);
        expect(vNumbers[4]).toBe(10);
        expect(vNumbers[5]).toBe(45);
      });
    });

    describe("sort()", () => {
      // Director MX 2004: "sorts a nonsorted alphabetical list"
      // Example: oldList.sort() on ["d", "a", "c", "b"] → ["a", "b", "c", "d"]
      it("sorts list in place (Director MX 2004 example)", () => {
        const oldList = list("d", "a", "c", "b");
        oldList.sort();
        expect(oldList[1]).toBe("a");
        expect(oldList[2]).toBe("b");
        expect(oldList[3]).toBe("c");
        expect(oldList[4]).toBe("d");
      });
    });

    describe("proxy access", () => {
      it("allows numeric index access", () => {
        const l = list(10, 20, 30);
        expect(l[1]).toBe(10);
        expect(l[2]).toBe(20);
        expect(l[3]).toBe(30);
      });

      it("allows numeric index assignment", () => {
        const l = list(10, 20, 30);
        l[2] = 99;
        expect(l[2]).toBe(99);
      });
    });
  });
});
