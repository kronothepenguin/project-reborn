import { describe, it, expect } from "vitest";
import { MemberRef } from "../member-ref.js";
import { Point, point } from "../point.js";
import { Rect, rect } from "../rect.js";

describe("MemberRef", () => {
  describe("constructor", () => {
    it("creates MemberRef with type and name", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "myBitmap");
      expect(m.type).toBe(Symbol.for("bitmap"));
      expect(m.name).toBe("myBitmap");
    });

    it("creates MemberRef with type only", () => {
      const m = new MemberRef(Symbol.for("sound"));
      expect(m.type).toBe(Symbol.for("sound"));
      expect(m.name).toBe("");
    });

    it("creates MemberRef with text type", () => {
      const m = new MemberRef(Symbol.for("text"), "headline");
      expect(m.type).toBe(Symbol.for("text"));
      expect(m.name).toBe("headline");
    });
  });

  describe("type (read-only)", () => {
    it("returns member type symbol", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.type).toBe(Symbol.for("bitmap"));
    });

    it("throws on set", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(() => { m.type = Symbol.for("text"); }).toThrow("type is read-only");
    });
  });

  describe("number (read-only)", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.number).toBe(0);
    });

    it("throws on set", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(() => { m.number = 5; }).toThrow("number is read-only");
    });

    it("returns number set via _setNumber", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m._setNumber(42);
      expect(m.number).toBe(42);
    });
  });

  describe("castLibNum (read-only)", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.castLibNum).toBe(0);
    });

    it("throws on set", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(() => { m.castLibNum = 3; }).toThrow("castLibNum is read-only");
    });

    it("returns castLibNum set via _setCastLibNum", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m._setCastLibNum(2);
      expect(m.castLibNum).toBe(2);
    });
  });

  describe("name (read-write)", () => {
    it("returns name from constructor", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "myBitmap");
      expect(m.name).toBe("myBitmap");
    });

    it("sets and gets name", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.name = "newName";
      expect(m.name).toBe("newName");
    });

    it("coerces to string", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.name = 123;
      expect(m.name).toBe("123");
    });
  });

  describe("text (read-write)", () => {
    it("defaults to empty string", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.text).toBe("");
    });

    it("sets and gets text", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      m.text = "Hello World";
      expect(m.text).toBe("Hello World");
    });

    it("coerces to string", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      m.text = 42;
      expect(m.text).toBe("42");
    });
  });

  describe("font (read-write)", () => {
    it("defaults to empty string", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      expect(m.font).toBe("");
    });

    it("sets and gets font", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      m.font = "Arial";
      expect(m.font).toBe("Arial");
    });
  });

  describe("fontSize (read-write)", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      expect(m.fontSize).toBe(0);
    });

    it("sets and gets fontSize", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      m.fontSize = 12;
      expect(m.fontSize).toBe(12);
    });

    it("coerces to number", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      m.fontSize = "24";
      expect(m.fontSize).toBe(24);
    });
  });

  describe("height (read-only)", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.height).toBe(0);
    });

    it("throws on set", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(() => { m.height = 100; }).toThrow("height is read-only");
    });

    it("returns height set via _setHeight", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m._setHeight(200);
      expect(m.height).toBe(200);
    });
  });

  describe("width (read-only)", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.width).toBe(0);
    });

    it("throws on set", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(() => { m.width = 100; }).toThrow("width is read-only");
    });

    it("returns width set via _setWidth", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m._setWidth(300);
      expect(m.width).toBe(300);
    });
  });

  describe("rect (read-write)", () => {
    it("defaults to rect(0,0,0,0)", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      const r = m.rect;
      expect(r).toBeInstanceOf(Rect);
      expect(r.left).toBe(0);
      expect(r.top).toBe(0);
      expect(r.right).toBe(0);
      expect(r.bottom).toBe(0);
    });

    it("sets and gets rect", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      const r = new Rect(10, 20, 110, 220);
      m.rect = r;
      expect(m.rect.left).toBe(10);
      expect(m.rect.top).toBe(20);
      expect(m.rect.right).toBe(110);
      expect(m.rect.bottom).toBe(220);
    });

    it("ignores non-Rect values", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.rect = "not a rect";
      expect(m.rect.left).toBe(0);
    });
  });

  describe("regPoint (read-write)", () => {
    it("defaults to point(0,0)", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      const p = m.regPoint;
      expect(p).toBeInstanceOf(Point);
      expect(p.locH).toBe(0);
      expect(p.locV).toBe(0);
    });

    it("sets and gets regPoint", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.regPoint = point(300, 400);
      expect(m.regPoint.locH).toBe(300);
      expect(m.regPoint.locV).toBe(400);
    });

    it("ignores non-Point values", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.regPoint = "not a point";
      expect(m.regPoint.locH).toBe(0);
    });
  });

  describe("duration", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      expect(m.duration).toBe(0);
    });

    it("sets and gets duration", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m.duration = 5000;
      expect(m.duration).toBe(5000);
    });

    it("returns 0 for non-media members", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      expect(m.duration).toBe(0);
    });
  });

  describe("loop", () => {
    it("defaults to false", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      expect(m.loop).toBe(false);
    });

    it("sets loop to true", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m.loop = true;
      expect(m.loop).toBe(true);
    });

    it("coerces to boolean", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m.loop = 1;
      expect(m.loop).toBe(true);
      m.loop = 0;
      expect(m.loop).toBe(false);
    });
  });

  describe("volume", () => {
    it("defaults to 255", () => {
      const m = new MemberRef(Symbol.for("swa"), "test");
      expect(m.volume).toBe(255);
    });

    it("sets volume", () => {
      const m = new MemberRef(Symbol.for("swa"), "test");
      m.volume = 128;
      expect(m.volume).toBe(128);
    });

    it("sets volume to 0 (mute)", () => {
      const m = new MemberRef(Symbol.for("swa"), "test");
      m.volume = 0;
      expect(m.volume).toBe(0);
    });
  });

  describe("type-specific property defaults", () => {
    it("bitmap member returns empty string for text", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.text).toBe("");
    });

    it("text member returns 0 for duration", () => {
      const m = new MemberRef(Symbol.for("text"), "test");
      expect(m.duration).toBe(0);
    });

    it("sound member returns empty string for text", () => {
      const m = new MemberRef(Symbol.for("sound"), "test");
      expect(m.text).toBe("");
    });

    it("bitmap member returns false for loop", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.loop).toBe(false);
    });

    it("text member returns empty string for font by default", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.font).toBe("");
    });

    it("non-media member returns 0 for percentStreamed", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.percentStreamed).toBe(0);
    });
  });

  describe("percentStreamed (read-only)", () => {
    it("defaults to 0", () => {
      const m = new MemberRef(Symbol.for("swa"), "test");
      expect(m.percentStreamed).toBe(0);
    });

    it("throws on set", () => {
      const m = new MemberRef(Symbol.for("swa"), "test");
      expect(() => { m.percentStreamed = 50; }).toThrow("percentStreamed is read-only");
    });

    it("returns value set via _setPercentStreamed", () => {
      const m = new MemberRef(Symbol.for("swa"), "test");
      m._setPercentStreamed(75);
      expect(m.percentStreamed).toBe(75);
    });
  });

  describe("preLoad", () => {
    it("defaults to false", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      expect(m.preLoad).toBe(false);
    });

    it("sets preLoad to true", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m.preLoad = true;
      expect(m.preLoad).toBe(true);
    });

    it("coerces to boolean", () => {
      const m = new MemberRef(Symbol.for("flash"), "test");
      m.preLoad = 1;
      expect(m.preLoad).toBe(true);
    });
  });

  describe("track methods", () => {
    it("trackCount returns 0 with no tracks", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      expect(m.trackCount()).toBe(0);
    });

    it("trackCount returns number of tracks", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m._setTracks([
        { startTime: 0, stopTime: 120, type: Symbol.for("video") },
        { startTime: 0, stopTime: 120, type: Symbol.for("sound") },
      ]);
      expect(m.trackCount()).toBe(2);
    });

    it("trackStartTime returns start time for track", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m._setTracks([
        { startTime: 0, stopTime: 120, type: Symbol.for("video") },
        { startTime: 120, stopTime: 240, type: Symbol.for("sound") },
      ]);
      expect(m.trackStartTime(2)).toBe(120);
    });

    it("trackStartTime returns 0 for missing track", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      expect(m.trackStartTime(5)).toBe(0);
    });

    it("trackStopTime returns stop time for track", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m._setTracks([
        { startTime: 0, stopTime: 120, type: Symbol.for("video") },
      ]);
      expect(m.trackStopTime(1)).toBe(120);
    });

    it("trackStopTime returns 0 for missing track", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      expect(m.trackStopTime(5)).toBe(0);
    });

    it("trackType returns type for track", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m._setTracks([
        { startTime: 0, stopTime: 120, type: Symbol.for("video") },
        { startTime: 0, stopTime: 120, type: Symbol.for("sound") },
        { startTime: 0, stopTime: 120, type: Symbol.for("text") },
      ]);
      expect(m.trackType(1)).toBe(Symbol.for("video"));
      expect(m.trackType(2)).toBe(Symbol.for("sound"));
      expect(m.trackType(3)).toBe(Symbol.for("text"));
    });

    it("trackType returns null for missing track", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      expect(m.trackType(5)).toBeNull();
    });
  });

  describe("fileName", () => {
    it("defaults to empty string", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.fileName).toBe("");
    });

    it("sets and gets fileName", () => {
      const m = new MemberRef(Symbol.for("QuickTimeMedia"), "test");
      m.fileName = "ChairAnimation";
      expect(m.fileName).toBe("ChairAnimation");
    });

    it("coerces to string", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.fileName = 42;
      expect(m.fileName).toBe("42");
    });
  });

  describe("picture", () => {
    it("defaults to null", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.picture).toBeNull();
    });

    it("sets and gets picture", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      const img = { width: 100, height: 50 };
      m.picture = img;
      expect(m.picture).toBe(img);
    });
  });

  describe("ink", () => {
    it("defaults to 0 (Copy)", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      expect(m.ink).toBe(0);
    });

    it("sets ink to matte (8)", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.ink = 8;
      expect(m.ink).toBe(8);
    });

    it("sets ink to blend (32)", () => {
      const m = new MemberRef(Symbol.for("bitmap"), "test");
      m.ink = 32;
      expect(m.ink).toBe(32);
    });
  });

  describe("sound", () => {
    it("defaults to true", () => {
      const m = new MemberRef(Symbol.for("flash"), "test");
      expect(m.sound).toBe(true);
    });

    it("sets sound to false", () => {
      const m = new MemberRef(Symbol.for("flash"), "test");
      m.sound = false;
      expect(m.sound).toBe(false);
    });

    it("toggles sound", () => {
      const m = new MemberRef(Symbol.for("digitalVideo"), "test");
      m.sound = !m.sound;
      expect(m.sound).toBe(false);
    });
  });

  describe("scale", () => {
    it("defaults to 1.0", () => {
      const m = new MemberRef(Symbol.for("flash"), "test");
      expect(m.scale).toBe(1.0);
    });

    it("sets scale", () => {
      const m = new MemberRef(Symbol.for("flash"), "test");
      m.scale = 0.5;
      expect(m.scale).toBe(0.5);
    });

    it("sets scale to 0", () => {
      const m = new MemberRef(Symbol.for("flash"), "test");
      m.scale = 0;
      expect(m.scale).toBe(0);
    });
  });
});
