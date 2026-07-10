import { describe, it, expect } from "vitest";
import { SpriteObject } from "../sprite-object.js";
import { Point, point } from "../point.js";
import { Rect } from "../rect.js";

describe("SpriteObject", () => {
  describe("constructor", () => {
    it("creates SpriteObject with num", () => {
      const s = new SpriteObject(1);
      expect(s.num).toBe(1);
      expect(s.spriteNum).toBe(1);
    });
  });

  describe("num / spriteNum (read-only)", () => {
    it("throws on set", () => {
      const s = new SpriteObject(1);
      expect(() => { s.num = 10; }).toThrow();
      expect(() => { s.spriteNum = 10; }).toThrow();
    });
  });

  describe("member / memberNum / castLib", () => {
    it("member roundtrip", () => {
      const s = new SpriteObject(1);
      const m = { name: "b" };
      s.member = m;
      expect(s.member).toBe(m);
    });
    it("memberNum coerces", () => {
      const s = new SpriteObject(1);
      s.memberNum = "5";
      expect(s.memberNum).toBe(5);
    });
    it("castLib coerces", () => {
      const s = new SpriteObject(1);
      s.castLib = 4;
      expect(s.castLib).toBe(4);
    });
  });

  describe("locH/locV/loc (mutually consistent geometry)", () => {
    it("locH sets left and right", () => {
      const s = new SpriteObject(1);
      s.width = 50;
      s.locH = 100;
      expect(s.left).toBe(100);
      expect(s.right).toBe(150);
    });
    it("locV sets top and bottom", () => {
      const s = new SpriteObject(1);
      s.height = 30;
      s.locV = 200;
      expect(s.top).toBe(200);
      expect(s.bottom).toBe(230);
    });
    it("loc returns Point and sets via Point", () => {
      const s = new SpriteObject(1);
      s.width = 10; s.height = 20;
      s.loc = point(150, 250);
      expect(s.left).toBe(150);
      expect(s.top).toBe(250);
      expect(s.right).toBe(160);
      expect(s.bottom).toBe(270);
    });
  });

  describe("Chapter-5 new geometry props", () => {
    it("width/height/left/top/right/bottom", () => {
      const s = new SpriteObject(1);
      s.left = 10; s.top = 20; s.width = 100; s.height = 50;
      expect(s.left).toBe(10);
      expect(s.top).toBe(20);
      expect(s.right).toBe(110);
      expect(s.bottom).toBe(70);
    });
    it("locZ coerces", () => {
      const s = new SpriteObject(1);
      s.locZ = 5;
      expect(s.locZ).toBe(5);
    });
    it("constraint/cursor coerce to number", () => {
      const s = new SpriteObject(1);
      s.constraint = 1; expect(s.constraint).toBe(1);
      s.cursor = 2; expect(s.cursor).toBe(2);
    });
    it("editable coerces to boolean", () => {
      const s = new SpriteObject(1);
      s.editable = 1; expect(s.editable).toBe(true);
    });
    it("endFrame/startFrame coerce to number", () => {
      const s = new SpriteObject(1);
      s.endFrame = 10; s.startFrame = 1;
      expect(s.endFrame).toBe(10);
      expect(s.startFrame).toBe(1);
    });
    it("flipH/flipV coerce to boolean", () => {
      const s = new SpriteObject(1);
      s.flipH = 1; expect(s.flipH).toBe(true);
      s.flipV = 0; expect(s.flipV).toBe(false);
    });
    it("quad/rotation/skew coerce to number", () => {
      const s = new SpriteObject(1);
      s.quad = 1; s.rotation = 90; s.skew = 5;
      expect(s.quad).toBe(1);
      expect(s.rotation).toBe(90);
      expect(s.skew).toBe(5);
    });
  });

  describe("ink/blend/visible/foreColor/backColor/name/currentTime/volume", () => {
    it("blend defaults 100, coerces", () => {
      const s = new SpriteObject(1);
      expect(s.blend).toBe(100);
      s.blend = 40; expect(s.blend).toBe(40);
    });
    it("visible coerces to boolean", () => {
      const s = new SpriteObject(1);
      s.visible = 0; expect(s.visible).toBe(false);
    });
    it("rect sets geometry", () => {
      const s = new SpriteObject(1);
      s.rect = new Rect(30, 40, 130, 140);
      expect(s.left).toBe(30);
      expect(s.top).toBe(40);
      expect(s.width).toBe(100);
      expect(s.height).toBe(100);
    });
    it("rect ignores non-Rect", () => {
      const s = new SpriteObject(1);
      s.rect = "x";
      expect(s.left).toBe(0);
    });
  });

  describe("track methods", () => {
    it("trackCount/Start/Stop/Type", () => {
      const s = new SpriteObject(1);
      s._setTracks([
        { startTime: 0, stopTime: 120, type: "video" },
      ]);
      expect(s.trackCount()).toBe(1);
      expect(s.trackStartTime(1)).toBe(0);
      expect(s.trackStopTime(1)).toBe(120);
      expect(s.trackType(1)).toBe("video");
      expect(s.trackType(99)).toBeNull();
    });
  });
});
