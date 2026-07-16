import { describe, it, expect, beforeEach } from "vitest";
import { SystemObject } from "../system.js";
import { _system } from "../../singletons.js";

describe("SystemObject", () => {
  describe("singleton", () => {
    it("_system is instance of SystemObject", () => {
      expect(_system).toBeInstanceOf(SystemObject);
    });
  });

  describe("Chapter-5 props (read-write)", () => {
    beforeEach(() => {
      _system.colorDepth = 32;
      _system.deskTopRectList = [];
      _system.environmentPropList = [];
    });

    it("colorDepth coerces to number", () => {
      _system.colorDepth = "16";
      expect(_system.colorDepth).toBe(16);
    });
    it("deskTopRectList coerces non-array to []", () => {
      _system.deskTopRectList = "x";
      expect(_system.deskTopRectList).toEqual([]);
    });
    it("environmentPropList accepts array", () => {
      _system.environmentPropList = [{ k: 1 }];
      expect(_system.environmentPropList).toEqual([{ k: 1 }]);
    });
    it("milliseconds is a non-negative integer (live value)", () => {
      const m = _system.milliseconds;
      expect(typeof m).toBe("number");
      expect(m).toBeGreaterThanOrEqual(0);
    });
  });

  describe("date() and time()", () => {
    it("date() returns a Date instance", () => {
      expect(_system.date()).toBeInstanceOf(Date);
    });
    it("time() matches H:M:S format", () => {
      expect(_system.time()).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });
  });

  describe("restart() and shutDown() (no-ops)", () => {
    it("restart() returns true without throwing", () => {
      expect(_system.restart()).toBe(true);
    });
    it("shutDown() returns true without throwing", () => {
      expect(_system.shutDown()).toBe(true);
    });
  });
});
