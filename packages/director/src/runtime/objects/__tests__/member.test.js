import { describe, it, expect } from "vitest";
import { MemberObject } from "../member.js";
import { Point } from "../../types/point.js";
import { Rect } from "../../types/rect.js";

describe("MemberObject (canon)", () => {
  describe("default construction", () => {
    it("documents default field values", () => {
      const m = new MemberObject();
      expect(m.name).toBe("");
      expect(m.number).toBe(0);
      expect(m.castLibNum).toBe(0);
      expect(m.type).toBe(Symbol.for(""));
      expect(m.mediaReady).toBe(false);
      expect(m.hilite).toBe(false);
      expect(m.purgePriority).toBe(3);
      expect(m.linked).toBe(false);
      expect(m.loaded).toBe(false);
      expect(m.modified).toBe(false);
      expect(m.comments).toBe("");
      expect(m.scriptText).toBe("");
      expect(m.size).toBe(0);
      expect(m.width).toBe(0);
      expect(m.height).toBe(0);
      expect(m.regPoint).toBeInstanceOf(Point);
      expect(m.rect).toBeInstanceOf(Rect);
    });
  });

  describe("constructor(type, name)", () => {
    it("sets type and name from positional args", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "hero");
      expect(m.type).toBe(Symbol.for("bitmap"));
      expect(m.name).toBe("hero");
    });

    it("leaves documented defaults when args are omitted", () => {
      const m = new MemberObject();
      expect(m.type).toBe(Symbol.for(""));
      expect(m.name).toBe("");
    });

    it("does not set type/name when explicitly undefined", () => {
      const m = new MemberObject(undefined, undefined);
      expect(m.type).toBe(Symbol.for(""));
      expect(m.name).toBe("");
    });
  });

  describe("writable documented fields", () => {
    it("comments is a plain writable field", () => {
      const m = new MemberObject();
      m.comments = "x";
      expect(m.comments).toBe("x");
    });

    it("fileName is a plain writable field", () => {
      const m = new MemberObject();
      m.fileName = "y";
      expect(m.fileName).toBe("y");
    });

    it("purgePriority is a plain writable field", () => {
      const m = new MemberObject();
      m.purgePriority = 0;
      expect(m.purgePriority).toBe(0);
    });

    it("number is a plain field — no throws on assignment (canon: no read-only enforcement)", () => {
      const m = new MemberObject();
      expect(() => { m.number = 7; }).not.toThrow();
      expect(m.number).toBe(7);
    });
  });

  describe("documented methods (no-op stubs per FR-014/FR-006)", () => {
    it("copyToClipBoard() callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.copyToClipBoard()).not.toThrow();
    });

    it("duplicate() callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.duplicate()).not.toThrow();
    });

    it("erase() callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.erase()).not.toThrow();
    });

    it("importFileInto(file) callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.importFileInto("foo")).not.toThrow();
    });

    it("move(intPosn) callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.move(1)).not.toThrow();
    });

    it("pasteClipBoardInto() callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.pasteClipBoardInto()).not.toThrow();
    });

    it("preLoad() callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.preLoad()).not.toThrow();
    });

    it("unLoad() callable as a no-op", () => {
      const m = new MemberObject();
      expect(() => m.unLoad()).not.toThrow();
    });
  });

  describe("no statics (FR-005)", () => {
    it("has no static registry or reset helpers", () => {
      expect(MemberObject._register).toBeUndefined();
      expect(MemberObject._reset).toBeUndefined();
    });
  });

  describe("surface", () => {
    it("prototype exposes the 8 documented methods", () => {
      for (const fn of ["copyToClipBoard", "duplicate", "erase", "importFileInto",
        "move", "pasteClipBoardInto", "preLoad", "unLoad"]) {
        expect(typeof MemberObject.prototype[fn]).toBe("function");
      }
    });

    it("instances expose the documented property fields", () => {
      const m = new MemberObject();
      for (const p of ["castLibNum", "comments", "creationDate", "fileName", "height", "hilite",
        "linked", "loaded", "media", "mediaReady", "modified", "modifiedBy", "modifiedDate",
        "name", "number", "purgePriority", "rect", "regPoint", "scriptText", "size",
        "thumbNail", "type", "width"]) {
        expect(Object.prototype.hasOwnProperty.call(m, p)).toBe(true);
      }
    });
  });
});