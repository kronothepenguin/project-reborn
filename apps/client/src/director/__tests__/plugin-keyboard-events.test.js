import { describe, it, expect, beforeEach } from "vitest";
import { _key } from "../api.js";

describe("Director Plugin - Keyboard Events", () => {
  beforeEach(() => {
    _key.keyCode = 0;
    _key.key = "";
    _key.shiftDown = false;
    _key.controlDown = false;
    _key.optionDown = false;
    _key.commandDown = false;
  });

  describe("keydown event", () => {
    it("updates _key.keyCode", () => {
      _key.keyCode = 65;
      expect(_key.keyCode).toBe(65);
    });

    it("updates _key.key", () => {
      _key.key = "a";
      expect(_key.key).toBe("a");
    });

    it("updates _key.shiftDown with shift", () => {
      _key.shiftDown = true;
      expect(_key.shiftDown).toBe(true);
    });

    it("updates _key.controlDown with ctrl", () => {
      _key.controlDown = true;
      expect(_key.controlDown).toBe(true);
    });

    it("updates _key.optionDown with alt", () => {
      _key.optionDown = true;
      expect(_key.optionDown).toBe(true);
    });

    it("updates _key.commandDown with meta", () => {
      _key.commandDown = true;
      expect(_key.commandDown).toBe(true);
    });
  });

  describe("keyup event", () => {
    it("clears key state", () => {
      _key.key = "";
      _key.keyCode = 0;
      expect(_key.key).toBe("");
      expect(_key.keyCode).toBe(0);
    });
  });
});
