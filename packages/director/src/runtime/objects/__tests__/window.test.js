import { describe, it, expect } from "vitest";
import { WindowObject } from "../window.js";
import { Rect } from "../../types/rect.js";

describe("WindowObject (canon)", () => {
  describe("constructor + name", () => {
    it("new WindowObject('Stage') sets name === 'Stage'", () => {
      expect(new WindowObject("Stage").name).toBe("Stage");
    });

    it("default name is ''", () => {
      expect(new WindowObject().name).toBe("");
    });
  });

  describe("documented defaults", () => {
    const w = new WindowObject("Sun");

    it("title === ''", () => {
      expect(w.title).toBe("");
    });
    it("fileName === ''", () => {
      expect(w.fileName).toBe("");
    });
    it("movie === null", () => {
      expect(w.movie).toBeNull();
    });
    it("visible === true", () => {
      expect(w.visible).toBe(true);
    });
    it("resizable === true", () => {
      expect(w.resizable).toBe(true);
    });
    it("dockingEnabled === true", () => {
      expect(w.dockingEnabled).toBe(true);
    });
    it("image === null", () => {
      expect(w.image).toBeNull();
    });
    it("picture === null", () => {
      expect(w.picture).toBeNull();
    });
    it("windowBehind === null", () => {
      expect(w.windowBehind).toBeNull();
    });
    it("windowInFront === null", () => {
      expect(w.windowInFront).toBeNull();
    });
    it("bgColor === 0", () => {
      expect(w.bgColor).toBe(0);
    });
    it("type === 1", () => {
      expect(w.type).toBe(1);
    });
    it("sizeState === 0", () => {
      expect(w.sizeState).toBe(0);
    });
    it("appearanceOptions === 0", () => {
      expect(w.appearanceOptions).toBe(0);
    });
    it("titlebarOptions === 0", () => {
      expect(w.titlebarOptions).toBe(0);
    });
  });

  describe("rect / sourceRect / drawRect are Rect instances", () => {
    const w = new WindowObject("Sun");

    it("rect is a Rect", () => {
      expect(w.rect).toBeInstanceOf(Rect);
    });
    it("sourceRect is a Rect", () => {
      expect(w.sourceRect).toBeInstanceOf(Rect);
    });
    it("drawRect is a Rect", () => {
      expect(w.drawRect).toBeInstanceOf(Rect);
    });
  });

  describe("plain assignment (no throws)", () => {
    const w = new WindowObject("Sun");

    it("title = 'X'", () => {
      w.title = "X";
      expect(w.title).toBe("X");
    });
    it("fileName = 'path'", () => {
      w.fileName = "path";
      expect(w.fileName).toBe("path");
    });
    it("movie = {x:1}", () => {
      w.movie = { x: 1 };
      expect(w.movie).toEqual({ x: 1 });
    });
    it("rect = new Rect(0,0,10,10)", () => {
      w.rect = new Rect(0, 0, 10, 10);
      expect(w.rect).toBeInstanceOf(Rect);
    });
    it("bgColor = 16", () => {
      w.bgColor = 16;
      expect(w.bgColor).toBe(16);
    });
    it("visible = false", () => {
      w.visible = false;
      expect(w.visible).toBe(false);
    });
    it("resizable = false", () => {
      w.resizable = false;
      expect(w.resizable).toBe(false);
    });
    it("type = 2", () => {
      w.type = 2;
      expect(w.type).toBe(2);
    });
    it("sizeState = 3", () => {
      w.sizeState = 3;
      expect(w.sizeState).toBe(3);
    });
    it("appearanceOptions = 5", () => {
      w.appearanceOptions = 5;
      expect(w.appearanceOptions).toBe(5);
    });
    it("titlebarOptions = 7", () => {
      w.titlebarOptions = 7;
      expect(w.titlebarOptions).toBe(7);
    });
    it("image = {} (Object.assign-able)", () => {
      w.image = {};
      expect(w.image).toEqual({});
    });
    it("picture = null re-assignable", () => {
      w.picture = null;
      expect(w.picture).toBeNull();
    });
    it("windowBehind = w (self)", () => {
      w.windowBehind = w;
      expect(w.windowBehind).toBe(w);
    });
    it("windowInFront = w (self)", () => {
      w.windowInFront = w;
      expect(w.windowInFront).toBe(w);
    });
    it("dockingEnabled = false", () => {
      w.dockingEnabled = false;
      expect(w.dockingEnabled).toBe(false);
    });
    it("name = 'Today'", () => {
      w.name = "Today";
      expect(w.name).toBe("Today");
    });
  });

  describe("Chapter-5 methods callable as no-ops (none throw)", () => {
    const w = new WindowObject("Sun");

    it("close()", () => {
      expect(() => w.close()).not.toThrow();
    });
    it("forget()", () => {
      expect(() => w.forget()).not.toThrow();
    });
    it("maximize()", () => {
      expect(() => w.maximize()).not.toThrow();
    });
    it("mergeProps({})", () => {
      expect(() => w.mergeProps({})).not.toThrow();
    });
    it("minimize()", () => {
      expect(() => w.minimize()).not.toThrow();
    });
    it("moveToBack()", () => {
      expect(() => w.moveToBack()).not.toThrow();
    });
    it("moveToFront()", () => {
      expect(() => w.moveToFront()).not.toThrow();
    });
    it("open()", () => {
      expect(() => w.open()).not.toThrow();
    });
    it("restore()", () => {
      expect(() => w.restore()).not.toThrow();
    });
  });

  describe("no statics (FR-005)", () => {
    it("WindowObject.window === undefined", () => {
      expect(WindowObject.window).toBeUndefined();
    });
    it("WindowObject.windowList === undefined", () => {
      expect(WindowObject.windowList).toBeUndefined();
    });
    it("WindowObject._register === undefined", () => {
      expect(WindowObject._register).toBeUndefined();
    });
    it("WindowObject._unregister === undefined", () => {
      expect(WindowObject._unregister).toBeUndefined();
    });
    it("WindowObject._bringToFront === undefined", () => {
      expect(WindowObject._bringToFront).toBeUndefined();
    });
    it("WindowObject._sendToBack === undefined", () => {
      expect(WindowObject._sendToBack).toBeUndefined();
    });
    it("WindowObject._reset === undefined", () => {
      expect(WindowObject._reset).toBeUndefined();
    });
  });

  describe("surface check", () => {
    it("prototype has all 9 documented methods", () => {
      for (const fn of [
        "close",
        "forget",
        "maximize",
        "mergeProps",
        "minimize",
        "moveToBack",
        "moveToFront",
        "open",
        "restore",
      ]) {
        expect(typeof WindowObject.prototype[fn]).toBe("function");
      }
    });

    it("instance has 19 documented property fields", () => {
      const w = new WindowObject("Sun");
      for (const p of [
        "appearanceOptions",
        "bgColor",
        "dockingEnabled",
        "drawRect",
        "fileName",
        "image",
        "movie",
        "name",
        "picture",
        "rect",
        "resizable",
        "sizeState",
        "sourceRect",
        "title",
        "titlebarOptions",
        "type",
        "visible",
        "windowBehind",
        "windowInFront",
      ]) {
        expect(Object.prototype.hasOwnProperty.call(w, p)).toBe(true);
      }
    });
  });
});