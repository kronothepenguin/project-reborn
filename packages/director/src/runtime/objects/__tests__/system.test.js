import { describe, it, expect } from "vitest";
import { SystemObject } from "../system.js";

describe("SystemObject (canon)", () => {
  describe("constructor defaults", () => {
    const s = new SystemObject();

    it("colorDepth === 32", () => {
      expect(s.colorDepth).toBe(32);
    });

    it("deskTopRectList is an array", () => {
      expect(Array.isArray(s.deskTopRectList)).toBe(true);
      expect(s.deskTopRectList).toEqual([]);
    });

    it("environmentPropList is an object", () => {
      expect(typeof s.environmentPropList).toBe("object");
      expect(s.environmentPropList).not.toBeNull();
    });

    it("milliseconds === 0", () => {
      expect(s.milliseconds).toBe(0);
    });
  });

  describe("methods callable", () => {
    it("date() returns '' per canon source", () => {
      expect(new SystemObject().date()).toBe("");
    });

    it("date(20240101) returns '' (stub)", () => {
      expect(new SystemObject().date(20240101)).toBe("");
    });

    it("time() is callable no-throw (canon returns undefined)", () => {
      const s = new SystemObject();
      expect(() => s.time()).not.toThrow();
    });

    it("restart() is callable no-op", () => {
      const s = new SystemObject();
      expect(() => s.restart()).not.toThrow();
      expect(s.restart()).toBeUndefined();
    });

    it("shutDown() is callable no-op", () => {
      const s = new SystemObject();
      expect(() => s.shutDown()).not.toThrow();
      expect(s.shutDown()).toBeUndefined();
    });
  });

  describe("no statics (FR-005)", () => {
    it("SystemObject._reset === undefined", () => {
      expect(SystemObject._reset).toBeUndefined();
    });

    it("SystemObject._register === undefined", () => {
      expect(SystemObject._register).toBeUndefined();
    });
  });

  describe("surface check", () => {
    it("prototype has documented methods", () => {
      for (const m of ["date", "restart", "shutDown", "time"]) {
        expect(typeof SystemObject.prototype[m]).toBe("function");
      }
    });

    it("instance has documented fields", () => {
      const s = new SystemObject();
      for (const f of [
        "colorDepth",
        "deskTopRectList",
        "environmentPropList",
        "milliseconds",
      ]) {
        expect(Object.prototype.hasOwnProperty.call(s, f)).toBe(true);
      }
    });
  });
});