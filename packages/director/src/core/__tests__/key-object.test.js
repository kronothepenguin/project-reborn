import { describe, it, expect, beforeEach } from "vitest";
import { KeyObject, _key } from "../key-object.js";

describe("KeyObject", () => {
  describe("singleton", () => {
    it("_key is instance of KeyObject", () => {
      expect(_key).toBeInstanceOf(KeyObject);
    });
  });

  describe("read-only props", () => {
    beforeEach(() => _key._reset());

    it("keyCode throws on set, accepts _setKeyCode", () => {
      expect(() => { _key.keyCode = 13; }).toThrow();
      _key._setKeyCode(65);
      expect(_key.keyCode).toBe(65);
    });

    it("key throws on set, accepts _setKey", () => {
      expect(() => { _key.key = "x"; }).toThrow();
      _key._setKey("RETURN");
      expect(_key.key).toBe("RETURN");
    });

    it("keyPressed() is a method that returns state", () => {
      expect(typeof _key.keyPressed).toBe("function");
      _key._setKeyPressed(true);
      expect(_key.keyPressed()).toBe(true);
    });

    it("commandDown/controlDown/shiftDown/optionDown all read-only, settable via _set*", () => {
      for (const f of ["CommandDown", "ControlDown", "ShiftDown", "OptionDown"]) {
        const lower = f.charAt(0).toLowerCase() + f.slice(1);
        expect(() => { _key[lower] = true; }).toThrow();
        _key[`_set${f}`](true);
        expect(_key[lower]).toBe(true);
      }
    });
  });

  describe("keyPressed() method", () => {
    beforeEach(() => _key._reset());
    it("returns boolean runtime state", () => {
      expect(_key.keyPressed()).toBe(false);
      _key._setKeyPressed(true);
      expect(_key.keyPressed()).toBe(true);
    });
  });

  describe("lastKey", () => {
    it("is read-only and accepts _setLastKey", () => {
      expect(() => { _key.lastKey = 65; }).toThrow();
      _key._setLastKey(65);
      expect(_key.lastKey).toBe(65);
    });
  });
});
