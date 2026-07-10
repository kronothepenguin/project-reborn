import { describe, it, expect, beforeEach } from "vitest";
import { GlobalObject, _global } from "../global-object.js";

describe("GlobalObject", () => {
  beforeEach(() => {
    _global.clearGlobals();
  });

  describe("singleton", () => {
    it("_global is exported as a Proxy", () => {
      expect(_global).toBeDefined();
      expect(typeof _global).toBe("object");
    });
  });

  describe("named global-variable store via singleton proxy", () => {
    it("set and get a named variable", () => {
      _global.gSuccess = "Congratulations!";
      expect(_global.gSuccess).toBe("Congratulations!");
    });

    it("returns undefined for unset variable", () => {
      expect(_global.neverSet).toBeUndefined();
    });

    it("supports has check", () => {
      _global.foo = 1;
      expect("foo" in _global).toBe(true);
      expect("bar" in _global).toBe(false);
    });

    it("deleteProperty removes a variable", () => {
      _global.foo = 1;
      delete _global.foo;
      expect(_global.foo).toBeUndefined();
    });

    it("object-type globals are stored", () => {
      _global.gState = { x: 1 };
      expect(_global.gState.x).toBe(1);
    });
  });

  describe("clearGlobals()", () => {
    it("empties the global-variable store", () => {
      _global.a = 1;
      _global.b = 2;
      _global.clearGlobals();
      expect(_global.a).toBeUndefined();
      expect(_global.b).toBeUndefined();
    });
  });

  describe("showGlobals()", () => {
    it("returns a snapshot of all stored globals", () => {
      _global.x = 1;
      _global.y = 2;
      const snap = _global.showGlobals();
      const names = snap.map((s) => s.name).sort();
      expect(names).toEqual(["x", "y"]);
    });

    it("returns empty array after clearGlobals", () => {
      _global.x = 1;
      _global.clearGlobals();
      expect(_global.showGlobals()).toEqual([]);
    });
  });

  describe("class form", () => {
    it("can be instantiated directly", () => {
      const g = new GlobalObject();
      g._set("a", 1);
      expect(g._get("a")).toBe(1);
      expect(g._has("a")).toBe(true);
      expect(g._list()).toEqual(["a"]);
      expect(g._delete("a")).toBe(true);
      expect(g._has("a")).toBe(false);
    });
  });
});
