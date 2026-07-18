import { describe, it, expect } from "vitest";
import { KeyObject } from "../key.js";

describe("KeyObject (canon)", () => {
  describe("constructor defaults", () => {
    const k = new KeyObject();

    it("commandDown === false", () => {
      expect(k.commandDown).toBe(false);
    });

    it("controlDown === false", () => {
      expect(k.controlDown).toBe(false);
    });

    it("key === ''", () => {
      expect(k.key).toBe("");
    });

    it("keyCode === 0", () => {
      expect(k.keyCode).toBe(0);
    });

    it("optionDown === false", () => {
      expect(k.optionDown).toBe(false);
    });

    it("shiftDown === false", () => {
      expect(k.shiftDown).toBe(false);
    });
  });

  describe("keyPressed()", () => {
    it("returns '' when no arg (documented default)", () => {
      expect(new KeyObject().keyPressed()).toBe("");
    });

    it("returns false for keyPressed('a')", () => {
      expect(new KeyObject().keyPressed("a")).toBe(false);
    });

    it("returns false for keyPressed(65)", () => {
      expect(new KeyObject().keyPressed(65)).toBe(false);
    });
  });

  describe("plain assignment (no throws)", () => {
    it("key = 'x'", () => {
      const k = new KeyObject();
      k.key = "x";
      expect(k.key).toBe("x");
    });

    it("keyCode = 65", () => {
      const k = new KeyObject();
      k.keyCode = 65;
      expect(k.keyCode).toBe(65);
    });

    it("commandDown = true", () => {
      const k = new KeyObject();
      k.commandDown = true;
      expect(k.commandDown).toBe(true);
    });
  });

  describe("no statics (FR-005)", () => {
    it("KeyObject._reset === undefined", () => {
      expect(KeyObject._reset).toBeUndefined();
    });

    it("KeyObject._setKey === undefined", () => {
      expect(KeyObject._setKey).toBeUndefined();
    });

    it("KeyObject._setKeyCode === undefined", () => {
      expect(KeyObject._setKeyCode).toBeUndefined();
    });

    it("KeyObject._setLastKey === undefined", () => {
      expect(KeyObject._setLastKey).toBeUndefined();
    });
  });

  describe("surface check", () => {
    it("prototype has keyPressed", () => {
      expect(typeof KeyObject.prototype.keyPressed).toBe("function");
    });

    it("instance has documented fields", () => {
      const k = new KeyObject();
      for (const f of [
        "commandDown",
        "controlDown",
        "key",
        "keyCode",
        "optionDown",
        "shiftDown",
      ]) {
        expect(Object.prototype.hasOwnProperty.call(k, f)).toBe(true);
      }
    });
  });
});