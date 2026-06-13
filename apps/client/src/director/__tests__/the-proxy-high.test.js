import { describe, it, expect } from "vitest";
import { the, _movie, _player, _mouse, _key, _system } from "../index.js";

describe("Director `the` Proxy - High Priority Properties", () => {
  describe("the.doubleClick", () => {
    it("maps to _mouse.doubleClick", () => {
      _mouse.doubleClick = true;
      expect(the.doubleClick).toBe(true);
      _mouse.doubleClick = false;
      expect(the.doubleClick).toBe(false);
    });
  });

  describe("the.stage", () => {
    it("returns stage dimensions object", () => {
      const stage = the.stage;
      expect(stage).toBeDefined();
      expect(stage.left).toBeDefined();
      expect(stage.top).toBeDefined();
      expect(stage.right).toBeDefined();
      expect(stage.bottom).toBeDefined();
    });
  });

  describe("the.keyCode", () => {
    it("maps to _key.keyCode", () => {
      _key.keyCode = 65;
      expect(the.keyCode).toBe(65);
      _key.keyCode = 0;
    });
  });

  describe("the.time", () => {
    it("returns formatted time string", () => {
      const t = the.time;
      expect(typeof t).toBe("string");
      expect(t.length).toBeGreaterThan(0);
    });
  });

  describe("the.shiftDown", () => {
    it("maps to _key.shiftDown", () => {
      _key.shiftDown = true;
      expect(the.shiftDown).toBe(true);
      _key.shiftDown = false;
      expect(the.shiftDown).toBe(false);
    });
  });

  describe("the.rollover", () => {
    it("returns rollover state", () => {
      const result = the.rollover;
      expect(typeof result).toBe("boolean");
    });
  });

  describe("the.key", () => {
    it("maps to _key.key", () => {
      _key.key = "a";
      expect(the.key).toBe("a");
      _key.key = "";
    });
  });

  describe("the.selStart", () => {
    it("returns selection start", () => {
      const result = the.selStart;
      expect(typeof result).toBe("number");
    });
  });

  describe("the.selEnd", () => {
    it("returns selection end", () => {
      const result = the.selEnd;
      expect(typeof result).toBe("number");
    });
  });
});
