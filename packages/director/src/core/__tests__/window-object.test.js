import { describe, it, expect, beforeEach } from "vitest";
import { WindowObject } from "../window-object.js";
import { Rect } from "../rect.js";

describe("WindowObject", () => {
  beforeEach(() => {
    WindowObject._reset();
  });

  describe("constructor + registration", () => {
    it("registers on construction", () => {
      const w = new WindowObject("Sun");
      expect(WindowObject.window["Sun"]).toBe(w);
      expect(WindowObject.windowList).toContain(w);
    });
    it("default name is empty", () => {
      const w = new WindowObject();
      expect(w.name).toBe("");
    });
  });

  describe("Chapter-5 methods", () => {
    let w;
    beforeEach(() => {
      w = new WindowObject("W");
    });
    it("open() sets visible=true", () => {
      w.visible = false;
      w.open();
      expect(w.visible).toBe(true);
    });
    it("close() sets visible=false", () => {
      w.close();
      expect(w.visible).toBe(false);
    });
    it("forget() unregisters from registry", () => {
      w.forget();
      expect(WindowObject.window["W"]).toBeNull();
    });
    it("maximize/minimize/restore set sizeState", () => {
      w.maximize(); expect(w.sizeState).toBe(2);
      w.minimize(); expect(w.sizeState).toBe(1);
      w.restore(); expect(w.sizeState).toBe(0);
    });
    it("moveToFront() puts window at end of list", () => {
      const a = new WindowObject("A");
      const b = new WindowObject("B");
      const c = new WindowObject("C");
      a.moveToFront();
      expect(WindowObject.windowList[WindowObject.windowList.length - 1]).toBe(a);
    });
    it("moveToBack() puts window at start of list", () => {
      const a = new WindowObject("A");
      const b = new WindowObject("B");
      const c = new WindowObject("C");
      c.moveToBack();
      expect(WindowObject.windowList[0]).toBe(c);
    });
    it("mergeProps() returns true", () => {
      expect(w.mergeProps({})).toBe(true);
    });
  });

  describe("Chapter-5 props (read-write)", () => {
    let w;
    beforeEach(() => {
      w = new WindowObject("W");
    });
    it("title/fileName coerce to string", () => {
      w.title = 5; expect(w.title).toBe("5");
      w.fileName = "x"; expect(w.fileName).toBe("x");
    });
    it("movie accepts null/value", () => {
      w.movie = null; expect(w.movie).toBeNull();
    });
    it("rect/sourceRect/drawRect accept Rect", () => {
      w.rect = new Rect(0, 0, 100, 100);
      expect(w.rect).toBeInstanceOf(Rect);
    });
    it("rect ignores non-Rect", () => {
      w.rect = "x";
      expect(w.rect.left).toBe(0);
    });
    it("bgColor coerces to number", () => {
      w.bgColor = "16"; expect(w.bgColor).toBe(16);
    });
    it("visible/resizable/dockingEnabled coerce to boolean", () => {
      w.visible = 0; expect(w.visible).toBe(false);
      w.resizable = 1; expect(w.resizable).toBe(true);
      w.dockingEnabled = 0; expect(w.dockingEnabled).toBe(false);
    });
    it("type/sizeState/appearanceOptions/titlebarOptions coerce to number", () => {
      w.type = 1; w.sizeState = 0; w.appearanceOptions = 2; w.titlebarOptions = 4;
      expect(w.type).toBe(1);
      expect(w.sizeState).toBe(0);
      expect(w.appearanceOptions).toBe(2);
      expect(w.titlebarOptions).toBe(4);
    });
    it("image/picture/windowBehind/windowInFront accept value or null", () => {
      w.image = {}; expect(w.image).toEqual({});
      w.picture = null; expect(w.picture).toBeNull();
      w.windowBehind = null; expect(w.windowBehind).toBeNull();
      w.windowInFront = null; expect(w.windowInFront).toBeNull();
    });
  });

  describe("registry: null for not-present named window", () => {
    it("returns null for unknown name", () => {
      expect(WindowObject.window["Nonexistent"]).toBeNull();
    });
  });

  describe("forget() removes from registry", () => {
    it("removes from window and windowList", () => {
      const w = new WindowObject("Tmp");
      const listBefore = WindowObject.windowList.length;
      w.forget();
      expect(WindowObject.window["Tmp"]).toBeNull();
      expect(WindowObject.windowList.length).toBe(listBefore - 1);
    });
  });
});
