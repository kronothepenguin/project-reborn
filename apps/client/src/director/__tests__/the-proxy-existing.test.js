import { describe, it, expect } from "vitest";
import { the, _movie, _player, _mouse } from "../index.js";

describe("Director `the` Proxy - Existing Properties", () => {
  describe("the.milliSeconds", () => {
    it("returns Date.now()", () => {
      const before = Date.now();
      const ms = the.milliSeconds;
      const after = Date.now();
      expect(ms).toBeGreaterThanOrEqual(before);
      expect(ms).toBeLessThanOrEqual(after);
    });
  });

  describe("the.mouseLoc", () => {
    it("returns Point-like object", () => {
      const loc = the.mouseLoc;
      expect(loc).toBeDefined();
    });
  });

  describe("the.mouseV and the.mouseH", () => {
    it("map correctly", () => {
      _mouse.mouseV = 100;
      _mouse.mouseH = 200;
      expect(the.mouseV).toBe(100);
      expect(the.mouseH).toBe(200);
    });
  });

  describe("the.itemDelimiter", () => {
    it("returns default delimiter", () => {
      expect(the.itemDelimiter).toBe(",");
    });

    it("can be set", () => {
      the.itemDelimiter = ";";
      expect(the.itemDelimiter).toBe(";");
      the.itemDelimiter = ",";
    });
  });

  describe("the.numberOfCastLibs", () => {
    it("maps to _movie._castCount", () => {
      _movie._castCount = 5;
      expect(the.numberOfCastLibs).toBe(5);
      _movie._castCount = 0;
    });
  });

  describe("the.runMode", () => {
    it("returns Plugin", () => {
      expect(the.runMode).toBe("Plugin");
    });
  });

  describe("the.stageRight, stageLeft, stageTop, stageBottom", () => {
    it("returns integer values", () => {
      expect(typeof the.stageRight).toBe("number");
      expect(typeof the.stageLeft).toBe("number");
      expect(typeof the.stageTop).toBe("number");
      expect(typeof the.stageBottom).toBe("number");
    });
  });

  describe("the.alertHook", () => {
    it("returns value", () => {
      expect(the.alertHook).toBeDefined();
    });
  });

  describe("the.environment", () => {
    it("returns object with productVersion", () => {
      const env = the.environment;
      expect(env).toBeDefined();
      expect(env[Symbol.for("productVersion")]).toBeDefined();
    });
  });

  describe("the.lastChannel", () => {
    it("returns value", () => {
      expect(typeof the.lastChannel).toBe("number");
    });
  });
});
