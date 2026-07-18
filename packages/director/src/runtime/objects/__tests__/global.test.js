import { describe, it, expect } from "vitest";
import { GlobalObject } from "../global.js";

describe("GlobalObject (canon)", () => {
  describe("constructor", () => {
    it("constructs an instance", () => {
      expect(new GlobalObject()).toBeInstanceOf(GlobalObject);
    });
  });

  describe("methods callable", () => {
    it("clearGlobals() is callable no-throw", () => {
      const g = new GlobalObject();
      expect(() => g.clearGlobals()).not.toThrow();
      expect(g.clearGlobals()).toBeUndefined();
    });

    it("showGlobals() is callable no-throw", () => {
      const g = new GlobalObject();
      expect(() => g.showGlobals()).not.toThrow();
      expect(g.showGlobals()).toBeUndefined();
    });
  });

  describe("no statics or registry (FR-005)", () => {
    it("GlobalObject._reset === undefined", () => {
      expect(GlobalObject._reset).toBeUndefined();
    });

    it("GlobalObject._register === undefined", () => {
      expect(GlobalObject._register).toBeUndefined();
    });

    it("GlobalObject.globals === undefined", () => {
      expect(GlobalObject.globals).toBeUndefined();
    });
  });

  describe("surface check", () => {
    it("prototype has documented methods", () => {
      for (const m of ["clearGlobals", "showGlobals"]) {
        expect(typeof GlobalObject.prototype[m]).toBe("function");
      }
    });
  });
});