import { describe, it, expect } from "vitest";
import {
  propList,
  getProp,
  getPropAt,
  findPos,
  symbol,
} from "../api.js";

describe("Director Property List Operations", () => {
  describe("propList()", () => {
    it("creates property list with symbol/value pairs", () => {
      const pl = propList(symbol("a"), 1, symbol("b"), 2);
      expect(pl.count).toBe(2);
    });

    it("creates empty property list", () => {
      const pl = propList();
      expect(pl.count).toBe(0);
    });
  });

  describe("getProp()", () => {
    it("retrieves value by symbol", () => {
      const pl = propList(symbol("name"), "John", symbol("age"), 30);
      expect(getProp(pl, symbol("name"))).toBe("John");
      expect(getProp(pl, symbol("age"))).toBe(30);
    });

    it("returns undefined for missing property", () => {
      const pl = propList(symbol("name"), "John");
      expect(getProp(pl, symbol("missing"))).toBe(undefined);
    });
  });

  describe("getPropAt()", () => {
    it("retrieves key at position", () => {
      const pl = propList(symbol("a"), 1, symbol("b"), 2);
      expect(getPropAt(pl, 1)).toBe(1);
      expect(getPropAt(pl, 2)).toBe(2);
    });
  });

  describe("findPos()", () => {
    it("finds position of property", () => {
      const pl = propList(symbol("a"), 1, symbol("b"), 2);
      expect(findPos(pl, symbol("a"))).toBe(1);
      expect(findPos(pl, symbol("b"))).toBe(2);
    });

    it("returns undefined for missing property", () => {
      const pl = propList(symbol("a"), 1);
      expect(findPos(pl, symbol("missing"))).toBe(undefined);
    });
  });

  describe("PropList class methods", () => {
    describe("addProp()", () => {
      it("adds property", () => {
        const pl = propList(symbol("a"), 1);
        pl.addProp(symbol("b"), 2);
        expect(pl.count).toBe(2);
      });
    });

    describe("deleteProp()", () => {
      it("deletes property by symbol", () => {
        const pl = propList(symbol("a"), 1, symbol("b"), 2);
        pl.deleteProp(symbol("a"));
        expect(pl.count).toBe(1);
      });
    });

    describe("duplicate()", () => {
      it("creates shallow copy", () => {
        const pl = propList(symbol("a"), 1, symbol("b"), 2);
        const copy = pl.duplicate();
        expect(copy.count).toBe(2);
        expect(copy).not.toBe(pl);
      });
    });

    describe("getaProp()", () => {
      it("gets property value by symbol", () => {
        const pl = propList(symbol("name"), "John");
        expect(pl.getaProp(symbol("name"))).toBe("John");
      });
    });

    describe("setaProp()", () => {
      it("sets property value", () => {
        const pl = propList(symbol("name"), "John");
        pl.setaProp(symbol("name"), "Jane");
        expect(pl.getaProp(symbol("name"))).toBe("Jane");
      });

      it("adds property if not exists", () => {
        const pl = propList(symbol("name"), "John");
        pl.setaProp(symbol("age"), 30);
        expect(pl.count).toBe(2);
      });
    });

    describe("proxy access", () => {
      it("allows symbol access", () => {
        const pl = propList(symbol("name"), "John");
        expect(pl[Symbol.for("name")]).toBe("John");
      });

      it("allows symbol assignment", () => {
        const pl = propList(symbol("name"), "John");
        pl[Symbol.for("name")] = "Jane";
        expect(pl[Symbol.for("name")]).toBe("Jane");
      });
    });
  });
});
