import { describe, it, expect } from "vitest";
import {
  voidP,
  voidp,
  integerP,
  integerp,
  floatP,
  floatp,
  listP,
  listp,
  objectP,
  objectp,
  stringP,
  stringp,
  symbolP,
  symbolp,
  rollover,
  rollOver,
  ilk,
  list,
  propList,
  symbol,
} from "../api.js";

describe("Director Type Checking Functions", () => {
  describe("voidP() / voidp()", () => {
    it("returns true for undefined", () => {
      expect(voidP(undefined)).toBe(true);
      expect(voidp(undefined)).toBe(true);
    });

    it("returns true for null (loose equality)", () => {
      expect(voidP(null)).toBe(true);
      expect(voidp(null)).toBe(true);
    });

    it("returns false for 0", () => {
      expect(voidP(0)).toBe(false);
      expect(voidp(0)).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(voidP("")).toBe(false);
      expect(voidp("")).toBe(false);
    });

    it("returns false for false", () => {
      expect(voidP(false)).toBe(false);
      expect(voidp(false)).toBe(false);
    });

    it("voidP and voidp are equivalent", () => {
      expect(voidP).toBe(voidp);
    });
  });

  describe("integerP() / integerp()", () => {
    it("returns true for integers", () => {
      expect(integerP(42)).toBe(true);
      expect(integerp(42)).toBe(true);
    });

    it("returns true for negative integers", () => {
      expect(integerP(-10)).toBe(true);
      expect(integerp(-10)).toBe(true);
    });

    it("returns true for zero", () => {
      expect(integerP(0)).toBe(true);
      expect(integerp(0)).toBe(true);
    });

    it("returns false for floats", () => {
      expect(integerP(3.14)).toBe(false);
      expect(integerp(3.14)).toBe(false);
    });

    it("returns false for NaN", () => {
      expect(integerP(NaN)).toBe(false);
      expect(integerp(NaN)).toBe(false);
    });

    it("returns false for strings", () => {
      expect(integerP("42")).toBe(false);
      expect(integerp("42")).toBe(false);
    });

    it("integerP and integerp are equivalent", () => {
      expect(integerP).toBe(integerp);
    });
  });

  describe("floatP() / floatp()", () => {
    it("returns true for floats", () => {
      expect(floatP(3.14)).toBe(true);
      expect(floatp(3.14)).toBe(true);
    });

    it("returns false for integers", () => {
      expect(floatP(42)).toBe(false);
      expect(floatp(42)).toBe(false);
    });

    it("returns false for NaN", () => {
      expect(floatP(NaN)).toBe(false);
      expect(floatp(NaN)).toBe(false);
    });

    it("returns false for strings", () => {
      expect(floatP("3.14")).toBe(false);
      expect(floatp("3.14")).toBe(false);
    });

    it("floatP and floatp are equivalent", () => {
      expect(floatP).toBe(floatp);
    });
  });

  describe("listP() / listp()", () => {
    it("returns true for List instances", () => {
      expect(listP(list(1, 2, 3))).toBe(true);
      expect(listp(list(1, 2, 3))).toBe(true);
    });

    it("returns true for empty list", () => {
      expect(listP(list())).toBe(true);
      expect(listp(list())).toBe(true);
    });

    it("returns false for arrays", () => {
      expect(listP([1, 2, 3])).toBe(false);
      expect(listp([1, 2, 3])).toBe(false);
    });

    it("returns false for propList", () => {
      expect(listP(propList(symbol("a"), 1))).toBe(false);
      expect(listp(propList(symbol("a"), 1))).toBe(false);
    });

    it("listP and listp are equivalent", () => {
      expect(listP).toBe(listp);
    });
  });

  describe("objectP() / objectp()", () => {
    it("returns false for null", () => {
      expect(objectP(null)).toBe(false);
      expect(objectp(null)).toBe(false);
    });

    it("returns false for undefined", () => {
      expect(objectP(undefined)).toBe(false);
      expect(objectp(undefined)).toBe(false);
    });

    it("returns false for primitives", () => {
      expect(objectP(42)).toBe(false);
      expect(objectP("string")).toBe(false);
      expect(objectP(true)).toBe(false);
    });

    it("objectP and objectp are equivalent", () => {
      expect(objectP).toBe(objectp);
    });
  });

  describe("stringP() / stringp()", () => {
    it("returns true for strings", () => {
      expect(stringP("hello")).toBe(true);
      expect(stringp("hello")).toBe(true);
    });

    it("returns true for empty string", () => {
      expect(stringP("")).toBe(true);
      expect(stringp("")).toBe(true);
    });

    it("returns false for numbers", () => {
      expect(stringP(42)).toBe(false);
      expect(stringp(42)).toBe(false);
    });

    it("returns false for null", () => {
      expect(stringP(null)).toBe(false);
      expect(stringp(null)).toBe(false);
    });

    it("stringP and stringp are equivalent", () => {
      expect(stringP).toBe(stringp);
    });
  });

  describe("symbolP() / symbolp()", () => {
    it("returns true for symbols", () => {
      expect(symbolP(Symbol.for("test"))).toBe(true);
      expect(symbolp(Symbol.for("test"))).toBe(true);
    });

    it("returns true for symbol() function result", () => {
      expect(symbolP(symbol("test"))).toBe(true);
      expect(symbolp(symbol("test"))).toBe(true);
    });

    it("returns false for strings", () => {
      expect(symbolP("test")).toBe(false);
      expect(symbolp("test")).toBe(false);
    });

    it("symbolP and symbolp are equivalent", () => {
      expect(symbolP).toBe(symbolp);
    });
  });

  describe("rollover / rollOver alias", () => {
    it("rollover and rollOver are equivalent", () => {
      expect(rollover).toBe(rollOver);
    });
  });

  describe("ilk()", () => {
    it("returns #integer for integers", () => {
      expect(ilk(42)).toBe(Symbol.for("integer"));
    });

    it("returns #float for floats", () => {
      expect(ilk(3.14)).toBe(Symbol.for("float"));
    });

    it("returns #string for strings", () => {
      expect(ilk("hello")).toBe(Symbol.for("string"));
    });

    it("returns #symbol for symbols", () => {
      expect(ilk(Symbol.for("test"))).toBe(Symbol.for("symbol"));
    });

    it("returns #void for undefined", () => {
      expect(ilk(undefined)).toBe(Symbol.for("void"));
    });

    it("returns #list for List instances", () => {
      expect(ilk(list(1, 2, 3))).toBe(Symbol.for("list"));
    });

    it("returns #propList for PropList instances", () => {
      expect(ilk(propList(symbol("a"), 1))).toBe(Symbol.for("propList"));
    });

    it("returns #list when type is #list and object is list", () => {
      expect(ilk(list(1, 2, 3), Symbol.for("list"))).toBe(true);
    });

    it("returns #number when type is #number and object is integer", () => {
      expect(ilk(42, Symbol.for("number"))).toBe(true);
    });

    it("returns #number when type is #number and object is float", () => {
      expect(ilk(3.14, Symbol.for("number"))).toBe(true);
    });

    it("returns false when type is #number and object is string", () => {
      expect(ilk("hello", Symbol.for("number"))).toBe(false);
    });
  });
});
