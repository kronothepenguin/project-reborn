import { describe, it, expect } from "vitest";
import { SpriteObject } from "../sprite.js";
import { Point } from "../../types/point.js";
import { Rect } from "../../types/rect.js";

describe("SpriteObject", () => {
  describe("constructor", () => {
    it("sets spriteNum from the first argument", () => {
      const s = new SpriteObject(5);
      expect(s.spriteNum).toBe(5);
    });

    it("defaults spriteNum to 0 when omitted", () => {
      const s = new SpriteObject();
      expect(s.spriteNum).toBe(0);
    });
  });

  describe("documented defaults", () => {
    it("blend/visible/flipH/member/memberNum defaults", () => {
      const s = new SpriteObject(1);
      expect(s.blend).toBe(100);
      expect(s.visible).toBe(true);
      expect(s.flipH).toBe(false);
      expect(s.member).toBeNull();
      expect(s.memberNum).toBe(0);
    });

    it("score-deferred geometry defaults to zero", () => {
      const s = new SpriteObject(1);
      expect(s.locH).toBe(0);
      expect(s.locV).toBe(0);
      expect(s.left).toBe(0);
      expect(s.top).toBe(0);
      expect(s.right).toBe(0);
      expect(s.bottom).toBe(0);
      expect(s.width).toBe(0);
      expect(s.height).toBe(0);
    });

    it("loc is a Point and rect is a Rect", () => {
      const s = new SpriteObject(1);
      expect(s.loc).toBeInstanceOf(Point);
      expect(s.rect).toBeInstanceOf(Rect);
    });
  });

  describe("methods", () => {
    it("hitTest() returns Symbol.for('background')", () => {
      const s = new SpriteObject(1);
      expect(s.hitTest({})).toBe(Symbol.for("background"));
    });

    it("flashToStage() returns the passed point unchanged", () => {
      const s = new SpriteObject(1);
      const p = { locH: 12, locV: 34 };
      expect(s.flashToStage(p)).toBe(p);
    });

    it("trackCount() returns 0", () => {
      const s = new SpriteObject(1);
      expect(s.trackCount()).toBe(0);
    });

    it("trackStartTime(n) and trackStopTime(n) return 0", () => {
      const s = new SpriteObject(1);
      expect(s.trackStartTime(1)).toBe(0);
      expect(s.trackStopTime(1)).toBe(0);
    });

    it("trackType(n) returns null", () => {
      const s = new SpriteObject(1);
      expect(s.trackType(1)).toBeNull();
    });

    it("callFrame() and goToFrame() are no-op stubs", () => {
      const s = new SpriteObject(1);
      expect(s.callFrame(10)).toBeUndefined();
      expect(s.goToFrame("intro")).toBeUndefined();
    });
  });

  describe("plain-field surface", () => {
    const surface = [
      "locH", "locV", "left", "top", "right", "bottom", "width", "height",
      "rect", "ink", "blend", "visible", "foreColor", "backColor", "rotation",
      "skew", "flipH", "flipV", "quad", "constraint", "cursor", "editable",
      "startFrame", "endFrame", "locZ", "member", "name", "memberNum",
      "castLib", "spriteNum",
    ];

    it("exposes every documented field as a plain own property", () => {
      const s = new SpriteObject(1);
      for (const p of surface) {
        expect(Object.prototype.hasOwnProperty.call(s, p)).toBe(true);
      }
    });

    it("does not define private fields or read-only throwing setters", () => {
      const s = new SpriteObject(1);
      expect(() => { s.spriteNum = 99; }).not.toThrow();
      // num was an internal-only alias in the AI-style file; it must not exist.
      expect("num" in s).toBe(false);
    });

    it("does not derive geometry: setting locH does not mutate left/right", () => {
      const s = new SpriteObject(1);
      s.locH = 10;
      expect(s.locH).toBe(10);
      expect(s.left).toBe(0);
      expect(s.right).toBe(0);
    });

    it("does not derive geometry: setting width does not mutate right", () => {
      const s = new SpriteObject(1);
      s.width = 50;
      expect(s.width).toBe(50);
      expect(s.right).toBe(0);
    });

    it("does not derive geometry: assigning rect does not mutate left/top/width", () => {
      const s = new SpriteObject(1);
      s.rect = new Rect(10, 20, 110, 70);
      expect(s.rect).toBeInstanceOf(Rect);
      expect(s.left).toBe(0);
      expect(s.top).toBe(0);
      expect(s.width).toBe(0);
    });
  });
});