import { describe, it, expect } from "vitest";
import { SpriteRef } from "../sprite-ref.js";
import { Point, point } from "../point.js";
import { Rect } from "../rect.js";

describe("SpriteRef", () => {
  describe("constructor", () => {
    it("creates SpriteRef with num", () => {
      const s = new SpriteRef(1);
      expect(s.num).toBe(1);
    });

    it("creates SpriteRef with different num", () => {
      const s = new SpriteRef(15);
      expect(s.num).toBe(15);
    });
  });

  describe("num (read-only)", () => {
    it("returns channel number", () => {
      const s = new SpriteRef(5);
      expect(s.num).toBe(5);
    });

    it("throws on set", () => {
      const s = new SpriteRef(1);
      expect(() => { s.num = 10; }).toThrow("num is read-only");
    });
  });

  describe("member (read-write)", () => {
    it("defaults to null", () => {
      const s = new SpriteRef(1);
      expect(s.member).toBeNull();
    });

    it("sets and gets member", () => {
      const s = new SpriteRef(1);
      const m = { name: "bitmap1", width: 100, height: 50 };
      s.member = m;
      expect(s.member).toBe(m);
    });
  });

  describe("memberNum (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.memberNum).toBe(0);
    });

    it("sets and gets memberNum", () => {
      const s = new SpriteRef(1);
      s.memberNum = 10;
      expect(s.memberNum).toBe(10);
    });

    it("coerces to number", () => {
      const s = new SpriteRef(1);
      s.memberNum = "5";
      expect(s.memberNum).toBe(5);
    });
  });

  describe("castLib (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.castLib).toBe(0);
    });

    it("sets and gets castLib", () => {
      const s = new SpriteRef(1);
      s.castLib = 4;
      expect(s.castLib).toBe(4);
    });
  });

  describe("locH (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.locH).toBe(0);
    });

    it("sets and gets locH", () => {
      const s = new SpriteRef(1);
      s.locH = 100;
      expect(s.locH).toBe(100);
    });

    it("coerces to number", () => {
      const s = new SpriteRef(1);
      s.locH = "200";
      expect(s.locH).toBe(200);
    });
  });

  describe("locV (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.locV).toBe(0);
    });

    it("sets and gets locV", () => {
      const s = new SpriteRef(1);
      s.locV = 200;
      expect(s.locV).toBe(200);
    });
  });

  describe("loc (Point)", () => {
    it("returns Point with locH and locV", () => {
      const s = new SpriteRef(1);
      s.locH = 100;
      s.locV = 200;
      const p = s.loc;
      expect(p).toBeInstanceOf(Point);
      expect(p.locH).toBe(100);
      expect(p.locV).toBe(200);
    });

    it("sets locH and locV via Point", () => {
      const s = new SpriteRef(1);
      s.loc = point(150, 250);
      expect(s.locH).toBe(150);
      expect(s.locV).toBe(250);
    });
  });

  describe("ink (read-write)", () => {
    it("defaults to 0 (Copy)", () => {
      const s = new SpriteRef(1);
      expect(s.ink).toBe(0);
    });

    it("sets ink to matte (8)", () => {
      const s = new SpriteRef(1);
      s.ink = 8;
      expect(s.ink).toBe(8);
    });

    it("sets ink to blend (32)", () => {
      const s = new SpriteRef(1);
      s.ink = 32;
      expect(s.ink).toBe(32);
    });
  });

  describe("blend (read-write)", () => {
    it("defaults to 100", () => {
      const s = new SpriteRef(1);
      expect(s.blend).toBe(100);
    });

    it("sets blend to 40", () => {
      const s = new SpriteRef(1);
      s.blend = 40;
      expect(s.blend).toBe(40);
    });

    it("sets blend to 0", () => {
      const s = new SpriteRef(1);
      s.blend = 0;
      expect(s.blend).toBe(0);
    });
  });

  describe("visible (read-write)", () => {
    it("defaults to true", () => {
      const s = new SpriteRef(1);
      expect(s.visible).toBe(true);
    });

    it("sets visible to false", () => {
      const s = new SpriteRef(1);
      s.visible = false;
      expect(s.visible).toBe(false);
    });

    it("coerces to boolean", () => {
      const s = new SpriteRef(1);
      s.visible = 0;
      expect(s.visible).toBe(false);
      s.visible = 1;
      expect(s.visible).toBe(true);
    });
  });

  describe("foreColor (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.foreColor).toBe(0);
    });

    it("sets foreColor", () => {
      const s = new SpriteRef(1);
      s.foreColor = 36;
      expect(s.foreColor).toBe(36);
    });
  });

  describe("backColor (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.backColor).toBe(0);
    });

    it("sets backColor", () => {
      const s = new SpriteRef(1);
      s.backColor = 255;
      expect(s.backColor).toBe(255);
    });
  });

  describe("rect", () => {
    it("returns rect from locH/locV with no member", () => {
      const s = new SpriteRef(1);
      s.locH = 10;
      s.locV = 20;
      const r = s.rect;
      expect(r).toBeInstanceOf(Rect);
      expect(r.left).toBe(10);
      expect(r.top).toBe(20);
      expect(r.right).toBe(10);
      expect(r.bottom).toBe(20);
    });

    it("returns rect from locH/locV and member dimensions", () => {
      const s = new SpriteRef(1);
      s.locH = 50;
      s.locV = 100;
      s.member = { width: 200, height: 150 };
      const r = s.rect;
      expect(r.left).toBe(50);
      expect(r.top).toBe(100);
      expect(r.right).toBe(250);
      expect(r.bottom).toBe(250);
    });

    it("sets locH/locV from rect", () => {
      const s = new SpriteRef(1);
      const r = new Rect(30, 40, 130, 140);
      s.rect = r;
      expect(s.locH).toBe(30);
      expect(s.locV).toBe(40);
    });
  });

  describe("name (read-write)", () => {
    it("defaults to empty string", () => {
      const s = new SpriteRef(1);
      expect(s.name).toBe("");
    });

    it("sets and gets name", () => {
      const s = new SpriteRef(1);
      s.name = "Background Sound";
      expect(s.name).toBe("Background Sound");
    });
  });

  describe("currentTime (read-write)", () => {
    it("defaults to 0", () => {
      const s = new SpriteRef(1);
      expect(s.currentTime).toBe(0);
    });

    it("sets currentTime in milliseconds", () => {
      const s = new SpriteRef(1);
      s.currentTime = 2700;
      expect(s.currentTime).toBe(2700);
    });
  });

  describe("volume (read-write)", () => {
    it("defaults to 256", () => {
      const s = new SpriteRef(1);
      expect(s.volume).toBe(256);
    });

    it("sets volume", () => {
      const s = new SpriteRef(1);
      s.volume = 128;
      expect(s.volume).toBe(128);
    });

    it("sets volume to 0 (mute)", () => {
      const s = new SpriteRef(1);
      s.volume = 0;
      expect(s.volume).toBe(0);
    });
  });

  describe("track methods", () => {
    it("trackCount returns 0 with no tracks", () => {
      const s = new SpriteRef(1);
      expect(s.trackCount()).toBe(0);
    });

    it("trackCount returns number of tracks", () => {
      const s = new SpriteRef(1);
      s._setTracks([
        { startTime: 0, stopTime: 120, type: "video" },
        { startTime: 0, stopTime: 120, type: "sound" },
      ]);
      expect(s.trackCount()).toBe(2);
    });

    it("trackStartTime returns start time for track", () => {
      const s = new SpriteRef(1);
      s._setTracks([
        { startTime: 0, stopTime: 120, type: "video" },
        { startTime: 120, stopTime: 240, type: "sound" },
      ]);
      expect(s.trackStartTime(2)).toBe(120);
    });

    it("trackStartTime returns 0 for missing track", () => {
      const s = new SpriteRef(1);
      expect(s.trackStartTime(5)).toBe(0);
    });

    it("trackStopTime returns stop time for track", () => {
      const s = new SpriteRef(1);
      s._setTracks([
        { startTime: 0, stopTime: 120, type: "video" },
      ]);
      expect(s.trackStopTime(1)).toBe(120);
    });

    it("trackStopTime returns 0 for missing track", () => {
      const s = new SpriteRef(1);
      expect(s.trackStopTime(5)).toBe(0);
    });

    it("trackType returns type for track", () => {
      const s = new SpriteRef(1);
      s._setTracks([
        { startTime: 0, stopTime: 120, type: "video" },
        { startTime: 0, stopTime: 120, type: "sound" },
        { startTime: 0, stopTime: 120, type: "text" },
      ]);
      expect(s.trackType(1)).toBe("video");
      expect(s.trackType(2)).toBe("sound");
      expect(s.trackType(3)).toBe("text");
    });

    it("trackType returns null for missing track", () => {
      const s = new SpriteRef(1);
      expect(s.trackType(5)).toBeNull();
    });
  });
});
