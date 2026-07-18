import { describe, it, expect } from "vitest";
import { CastLibraryObject } from "../cast-library.js";

describe("CastLibraryObject (canon)", () => {
  describe("default construction", () => {
    it("documents default field values", () => {
      const c = new CastLibraryObject();
      expect(c.name).toBe("");
      expect(c.number).toBe(0);
      expect(c.fileName).toBe("");
      expect(c.preLoadMode).toBe(0);
      expect(c.member).toEqual({});
      expect(c.selection).toBeUndefined();
    });
  });

  describe("writable documented fields", () => {
    it("name is a plain writable field", () => {
      const c = new CastLibraryObject();
      c.name = "X";
      expect(c.name).toBe("X");
    });

    it("preLoadMode is a plain writable field", () => {
      const c = new CastLibraryObject();
      c.preLoadMode = 2;
      expect(c.preLoadMode).toBe(2);
    });

    it("number is a plain field — no throws on assignment (canon: no read-only enforcement)", () => {
      const c = new CastLibraryObject();
      expect(() => { c.number = 5; }).not.toThrow();
      expect(c.number).toBe(5);
    });

    it("fileName is a plain writable field", () => {
      const c = new CastLibraryObject();
      c.fileName = "external.cst";
      expect(c.fileName).toBe("external.cst");
    });

    it("member is a plain writable field", () => {
      const c = new CastLibraryObject();
      c.member = { 1: "x" };
      expect(c.member[1]).toBe("x");
    });

    it("selection is a plain writable field", () => {
      const c = new CastLibraryObject();
      c.selection = "sel";
      expect(c.selection).toBe("sel");
    });
  });

  describe("findEmpty()", () => {
    it("returns 0 (documented v1 stub default)", () => {
      const c = new CastLibraryObject();
      expect(c.findEmpty()).toBe(0);
    });

    it("accepts the optional memberObjRef argument without throwing", () => {
      const c = new CastLibraryObject();
      expect(() => c.findEmpty({ number: 1 })).not.toThrow();
      expect(c.findEmpty({ number: 1 })).toBe(0);
    });
  });

  describe("surface", () => {
    it("prototype exposes findEmpty", () => {
      expect(typeof CastLibraryObject.prototype.findEmpty).toBe("function");
    });

    it("instances expose the documented property fields", () => {
      const c = new CastLibraryObject();
      for (const p of ["fileName", "member", "name", "number", "preLoadMode", "selection"]) {
        expect(Object.prototype.hasOwnProperty.call(c, p)).toBe(true);
      }
    });
  });

  describe("no statics (FR-005)", () => {
    it("has no static registry or reset helpers", () => {
      expect(CastLibraryObject.castLib).toBeUndefined();
      expect(CastLibraryObject._register).toBeUndefined();
      expect(CastLibraryObject._reset).toBeUndefined();
      expect(CastLibraryObject.activeCastLib).toBeUndefined();
    });
  });
});