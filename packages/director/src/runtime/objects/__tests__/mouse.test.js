import { describe, it, expect } from "vitest";
import { MouseObject } from "../mouse.js";
import { Point } from "../../types/point.js";

describe("MouseObject (canon)", () => {
  describe("constructor defaults", () => {
    const m = new MouseObject();

    it("mouseH === 0", () => {
      expect(m.mouseH).toBe(0);
    });

    it("mouseV === 0", () => {
      expect(m.mouseV).toBe(0);
    });

    it("mouseDown === false", () => {
      expect(m.mouseDown).toBe(false);
    });

    it("mouseUp === false", () => {
      expect(m.mouseUp).toBe(false);
    });

    it("stillDown === false", () => {
      expect(m.stillDown).toBe(false);
    });

    it("doubleClick === undefined (uninitialized plain field)", () => {
      expect(m.doubleClick).toBeUndefined();
    });

    it("clickOn === undefined (uninitialized plain field)", () => {
      expect(m.clickOn).toBeUndefined();
    });

    it("mouseChar === -1", () => {
      expect(m.mouseChar).toBe(-1);
    });

    it("mouseItem === -1", () => {
      expect(m.mouseItem).toBe(-1);
    });

    it("mouseLine === -1", () => {
      expect(m.mouseLine).toBe(-1);
    });

    it("mouseWord === -1", () => {
      expect(m.mouseWord).toBe(-1);
    });

    it("mouseMember === null", () => {
      expect(m.mouseMember).toBeNull();
    });

    it("rightMouseDown === false", () => {
      expect(m.rightMouseDown).toBe(false);
    });

    it("rightMouseUp === false", () => {
      expect(m.rightMouseUp).toBe(false);
    });

    it("mouseLoc is instance of Point", () => {
      expect(m.mouseLoc).toBeInstanceOf(Point);
    });

    it("clickLoc === undefined (uninitialized plain field)", () => {
      expect(m.clickLoc).toBeUndefined();
    });
  });

  describe("plain assignment (no throws, no read-only enforcement)", () => {
    it("mouseH = 100", () => {
      const m = new MouseObject();
      m.mouseH = 100;
      expect(m.mouseH).toBe(100);
    });

    it("mouseDown = true", () => {
      const m = new MouseObject();
      m.mouseDown = true;
      expect(m.mouseDown).toBe(true);
    });

    it("clickOn = 1 (fields are not read-only enforced)", () => {
      const m = new MouseObject();
      m.clickOn = 1;
      expect(m.clickOn).toBe(1);
    });
  });

  describe("no statics (FR-005)", () => {
    it("MouseObject._reset === undefined", () => {
      expect(MouseObject._reset).toBeUndefined();
    });

    it("MouseObject._setMouseH === undefined", () => {
      expect(MouseObject._setMouseH).toBeUndefined();
    });

    it("MouseObject._setClickLoc === undefined", () => {
      expect(MouseObject._setClickLoc).toBeUndefined();
    });

    it("MouseObject._register === undefined", () => {
      expect(MouseObject._register).toBeUndefined();
    });
  });

  describe("surface check", () => {
    it("instance has documented fields", () => {
      const m = new MouseObject();
      for (const f of [
        "clickLoc",
        "clickOn",
        "doubleClick",
        "mouseChar",
        "mouseDown",
        "mouseH",
        "mouseItem",
        "mouseLine",
        "mouseLoc",
        "mouseMember",
        "mouseUp",
        "mouseV",
        "mouseWord",
        "rightMouseDown",
        "rightMouseUp",
        "stillDown",
      ]) {
        expect(Object.prototype.hasOwnProperty.call(m, f)).toBe(true);
      }
    });
  });
});