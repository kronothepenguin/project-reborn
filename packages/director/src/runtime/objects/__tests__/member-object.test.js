import { describe, it, expect } from "vitest";
import { MemberObject } from "../member.js";
import { Point, point } from "../../types/point.js";
import { Rect, rect } from "../../types/rect.js";

describe("MemberObject", () => {
  describe("constructor", () => {
    it("creates MemberObject with type and name", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "myBitmap");
      expect(m.type).toBe(Symbol.for("bitmap"));
      expect(m.name).toBe("myBitmap");
    });
  });

  describe("type (read-only)", () => {
    it("throws on set", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      expect(() => { m.type = Symbol.for("text"); }).toThrow("type is read-only");
    });
  });

  describe("number (read-only)", () => {
    it("throws on set, accepts _setNumber", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      expect(() => { m.number = 5; }).toThrow();
      m._setNumber(42);
      expect(m.number).toBe(42);
    });
  });

  describe("castLibNum (read-only)", () => {
    it("throws on set, accepts _setCastLibNum", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      expect(() => { m.castLibNum = 3; }).toThrow();
      m._setCastLibNum(2);
      expect(m.castLibNum).toBe(2);
    });
  });

  describe("name (read-write)", () => {
    it("coerces to string", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      m.name = 123;
      expect(m.name).toBe("123");
    });
  });

  describe("text, font, fontSize (read-write)", () => {
    it("text coerces to string", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      m.text = 42;
      expect(m.text).toBe("42");
    });
    it("fontSize coerces to number", () => {
      const m = new MemberObject(Symbol.for("text"), "test");
      m.fontSize = "24";
      expect(m.fontSize).toBe(24);
    });
  });

  describe("height/width (read-only)", () => {
    it("throws on set, accepts _set", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      expect(() => { m.height = 100; }).toThrow();
      m._setHeight(200);
      expect(m.height).toBe(200);
    });
  });

  describe("rect (read-write)", () => {
    it("defaults to rect(0,0,0,0)", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      const r = m.rect;
      expect(r).toBeInstanceOf(Rect);
      expect(r.left).toBe(0);
    });
    it("sets and gets rect", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      m.rect = new Rect(10, 20, 110, 220);
      expect(m.rect.left).toBe(10);
    });
    it("ignores non-Rect", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      m.rect = "not a rect";
      expect(m.rect.left).toBe(0);
    });
  });

  describe("regPoint (read-write)", () => {
    it("sets and gets regPoint", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      m.regPoint = point(300, 400);
      expect(m.regPoint.locH).toBe(300);
    });
    it("ignores non-Point", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "test");
      m.regPoint = "x";
      expect(m.regPoint.locH).toBe(0);
    });
  });

  describe("duration, loop, volume, sound, scale, ink, preLoad, fileName, picture", () => {
    it("duration sets and gets", () => {
      const m = new MemberObject(Symbol.for("digitalVideo"), "x");
      m.duration = 5000;
      expect(m.duration).toBe(5000);
    });
    it("loop coerces to boolean", () => {
      const m = new MemberObject(Symbol.for("digitalVideo"), "x");
      m.loop = 1;
      expect(m.loop).toBe(true);
    });
    it("volume defaults to 255", () => {
      expect(new MemberObject(Symbol.for("swa"), "x").volume).toBe(255);
    });
    it("sound defaults to true, toggles", () => {
      const m = new MemberObject(Symbol.for("flash"), "x");
      expect(m.sound).toBe(true);
      m.sound = !m.sound;
      expect(m.sound).toBe(false);
    });
    it("scale defaults to 1.0", () => {
      expect(new MemberObject(Symbol.for("flash"), "x").scale).toBe(1.0);
    });
    it("ink accepts matte 8, blend 32", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      m.ink = 8; expect(m.ink).toBe(8);
      m.ink = 32; expect(m.ink).toBe(32);
    });
    it("preLoad/unLoad methods toggle loaded", () => {
      const m = new MemberObject(Symbol.for("flash"), "x");
      m.preLoad();
      expect(m.loaded).toBe(true);
      m.unLoad();
      expect(m.loaded).toBe(false);
    });
    it("fileName coerces to string", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      m.fileName = 42; expect(m.fileName).toBe("42");
    });
    it("picture accepts arbitrary", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      m.picture = { width: 1, height: 1 };
      expect(m.picture.width).toBe(1);
    });
  });

  describe("percentStreamed (read-only)", () => {
    it("throws on set, accepts _setPercentStreamed", () => {
      const m = new MemberObject(Symbol.for("swa"), "x");
      expect(() => { m.percentStreamed = 50; }).toThrow();
      m._setPercentStreamed(75);
      expect(m.percentStreamed).toBe(75);
    });
  });

  describe("Chapter-5 new props", () => {
    it("comments default and set", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      expect(m.comments).toBe("");
      m.comments = "hi";
      expect(m.comments).toBe("hi");
    });
    it("creationDate is read-only, accepts _set", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      expect(() => { m.creationDate = "x"; }).toThrow();
      m._setCreationDate("2025-01-01");
      expect(m.creationDate).toBe("2025-01-01");
    });
    it("hilite, linked, loaded, mediaReady, modified, purgePriority, size, scriptText, thumbNail, media, modifiedBy, modifiedDate", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      m.hilite = true; expect(m.hilite).toBe(true);
      expect(() => { m.linked = true; }).toThrow();
      m.loaded = true; expect(m.loaded).toBe(true);
      m.mediaReady = true; expect(m.mediaReady).toBe(true);
      m.modified = true; expect(m.modified).toBe(true);
      m.purgePriority = 5; expect(m.purgePriority).toBe(5);
      m.size = 10; expect(m.size).toBe(10);
      m.scriptText = "on x"; expect(m.scriptText).toBe("on x");
      m.thumbNail = {}; expect(m.thumbNail).toEqual({});
      m.media = { kind: "img" }; expect(m.media).toEqual({ kind: "img" });
      m.modifiedBy = "alice"; expect(m.modifiedBy).toBe("alice");
      m.modifiedDate = "today"; expect(m.modifiedDate).toBe("today");
    });
  });

  describe("Chapter-5 new methods", () => {
    it("preLoad/unLoad toggle loaded", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      m.preLoad();
      expect(m.loaded).toBe(true);
      m.unLoad();
      expect(m.loaded).toBe(false);
    });
    it("copyToClipBoard/duplicate/erase/importFileInto/move/pasteClipBoardInto return without throwing", () => {
      const m = new MemberObject(Symbol.for("bitmap"), "x");
      expect(() => m.copyToClipBoard()).not.toThrow();
      expect(() => m.duplicate()).not.toThrow();
      expect(m.erase()).toBe(true);
      expect(m.importFileInto()).toBe(true);
      expect(m.move(1)).toBe(true);
      expect(m.pasteClipBoardInto()).toBe(true);
    });
  });

  describe("track methods", () => {
    it("trackCount returns 0 with no tracks", () => {
      expect(new MemberObject(Symbol.for("digitalVideo"), "x").trackCount()).toBe(0);
    });
    it("trackStartTime/trackStopTime/trackType", () => {
      const m = new MemberObject(Symbol.for("digitalVideo"), "x");
      m._setTracks([
        { startTime: 0, stopTime: 120, type: Symbol.for("video") },
        { startTime: 120, stopTime: 240, type: Symbol.for("sound") },
      ]);
      expect(m.trackCount()).toBe(2);
      expect(m.trackStartTime(2)).toBe(120);
      expect(m.trackStopTime(1)).toBe(120);
      expect(m.trackType(2)).toBe(Symbol.for("sound"));
      expect(m.trackType(5)).toBeNull();
      expect(m.trackStartTime(99)).toBe(0);
    });
  });
});
