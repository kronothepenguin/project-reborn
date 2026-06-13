import { describe, it, expect } from "vitest";
import { the, _movie, _player, _mouse, _key, _system } from "../index.js";

describe("Director `the` Proxy - Medium Priority Properties", () => {
  describe("the.randomSeed", () => {
    it("maps to _system.randomSeed", () => {
      _system.randomSeed = 12345;
      expect(the.randomSeed).toBe(12345);
      _system.randomSeed = 0;
    });
  });

  describe("the.optionDown", () => {
    it("maps to _key.optionDown", () => {
      _key.optionDown = true;
      expect(the.optionDown).toBe(true);
      _key.optionDown = false;
      expect(the.optionDown).toBe(false);
    });
  });

  describe("the.frameTempo", () => {
    it("maps to _movie.frameTempo", () => {
      _movie._frameTempo = 30;
      expect(the.frameTempo).toBe(30);
    });
  });

  describe("the.date", () => {
    it("returns formatted date string", () => {
      const d = the.date;
      expect(typeof d).toBe("string");
      expect(d.length).toBeGreaterThan(0);
    });
  });

  describe("the.colorDepth", () => {
    it("maps to _system.colorDepth", () => {
      expect(the.colorDepth).toBe(32);
    });
  });

  describe("the.timer", () => {
    it("maps to _system.timer", () => {
      const t = the.timer;
      expect(typeof t).toBe("number");
    });
  });

  describe("the.moviePath", () => {
    it("maps to _movie.moviePath", () => {
      expect(typeof the.moviePath).toBe("string");
    });
  });

  describe("the.platform", () => {
    it("maps to _system.platform", () => {
      const p = the.platform;
      expect(typeof p).toBe("string");
    });
  });

  describe("the.floatPrecision", () => {
    it("maps to _system.floatPrecision", () => {
      expect(the.floatPrecision).toBe(6);
    });
  });

  describe("the.debugPlaybackEnabled", () => {
    it("maps to _player.debugPlaybackEnabled", () => {
      _player.debugPlaybackEnabled = true;
      expect(the.debugPlaybackEnabled).toBe(true);
      _player.debugPlaybackEnabled = false;
      expect(the.debugPlaybackEnabled).toBe(false);
    });
  });

  describe("the.maxinteger", () => {
    it("returns Number.MAX_SAFE_INTEGER", () => {
      expect(the.maxinteger).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("the.commandDown", () => {
    it("maps to _key.commandDown", () => {
      _key.commandDown = true;
      expect(the.commandDown).toBe(true);
      _key.commandDown = false;
      expect(the.commandDown).toBe(false);
    });
  });

  describe("the.clickOn", () => {
    it("maps to _mouse.clickOn", () => {
      _mouse.clickOn = 5;
      expect(the.clickOn).toBe(5);
      _mouse.clickOn = 0;
    });
  });

  describe("the.frame", () => {
    it("maps to _movie.frame", () => {
      _movie._frame = 10;
      expect(the.frame).toBe(10);
      _movie._frame = 0;
    });
  });
});
