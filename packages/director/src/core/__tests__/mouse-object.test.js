import { describe, it, expect, beforeEach } from "vitest";
import { MouseObject, _mouse } from "../mouse-object.js";

describe("MouseObject", () => {
  describe("singleton", () => {
    it("_mouse is instance of MouseObject", () => {
      expect(_mouse).toBeInstanceOf(MouseObject);
    });
  });

  describe("read-only input state (all 17 props)", () => {
    beforeEach(() => {
      _mouse._reset();
    });

    const RO = ["mouseH", "mouseV", "mouseDown", "mouseUp", "doubleClick", "clickOn", "clickLoc",
      "rollover", "stillDown", "mouseChar", "mouseItem", "mouseLine", "mouseLoc", "mouseMember",
      "mouseWord", "rightMouseDown", "rightMouseUp", "lastClick", "lastEvent"];

    it.each(RO)("%s throws on set", (prop) => {
      expect(() => { _mouse[prop] = "anything"; }).toThrow(/read-only/);
    });

    it("mouseH/V default to 0", () => {
      expect(_mouse.mouseH).toBe(0);
      expect(_mouse.mouseV).toBe(0);
    });

    it("mouseDown default false, mouseUp true, stillDown false", () => {
      expect(_mouse.mouseDown).toBe(false);
      expect(_mouse.mouseUp).toBe(true);
      expect(_mouse.stillDown).toBe(false);
    });

    it("doubleClick default false, clickOn default 0", () => {
      expect(_mouse.doubleClick).toBe(false);
      expect(_mouse.clickOn).toBe(0);
    });

    it("clickLoc default {h:0, v:0}", () => {
      expect(_mouse.clickLoc).toEqual({ h: 0, v: 0 });
    });

    it("mouseChar/Item/Line/Word defaults", () => {
      expect(_mouse.mouseChar).toBe("");
      expect(_mouse.mouseItem).toBe("");
      expect(_mouse.mouseLine).toBe(0);
      expect(_mouse.mouseWord).toBe(0);
    });

    it("mouseMember default 0", () => {
      expect(_mouse.mouseMember).toBe(0);
    });

    it("mouseLoc returns h/v point", () => {
      expect(_mouse.mouseLoc).toEqual({ h: 0, v: 0 });
    });

    it("rightMouseDown default false, rightMouseUp default true", () => {
      expect(_mouse.rightMouseDown).toBe(false);
      expect(_mouse.rightMouseUp).toBe(true);
    });

    it("lastClick default 0, lastEvent default 'mouseUp'", () => {
      expect(_mouse.lastClick).toBe(0);
      expect(_mouse.lastEvent).toBe("mouseUp");
    });
  });

  describe("runtime feeds", () => {
    beforeEach(() => _mouse._reset());

    it("_setMouseH/V update values", () => {
      _mouse._setMouseH(100);
      _mouse._setMouseV(200);
      expect(_mouse.mouseH).toBe(100);
      expect(_mouse.mouseV).toBe(200);
    });

    it("_setMouseDown toggles down/up/stillDown", () => {
      _mouse._setMouseDown(true);
      expect(_mouse.mouseDown).toBe(true);
      expect(_mouse.mouseUp).toBe(false);
      expect(_mouse.stillDown).toBe(true);
    });

    it("_setClickLoc updates clickLoc", () => {
      _mouse._setClickLoc(50, 75);
      expect(_mouse.clickLoc).toEqual({ h: 50, v: 75 });
    });

    it("_setMouseMember updates", () => {
      _mouse._setMouseMember(7);
      expect(_mouse.mouseMember).toBe(7);
    });
  });

  describe("cursor (read-write)", () => {
    it("coerces to number", () => {
      _mouse.cursor = "5";
      expect(_mouse.cursor).toBe(5);
    });
  });

  describe("script hooks (read-write)", () => {
    it("keyDownScript coerces null to empty", () => {
      _mouse.keyDownScript = null;
      expect(_mouse.keyDownScript).toBe("");
    });
    it("mouseUpScript sets and gets", () => {
      _mouse.mouseUpScript = "up";
      expect(_mouse.mouseUpScript).toBe("up");
    });
  });
});
