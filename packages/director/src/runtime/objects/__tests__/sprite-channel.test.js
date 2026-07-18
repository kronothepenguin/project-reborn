import { describe, it, expect } from "vitest";
import { SpriteChannelObject } from "../sprite-channel.js";

describe("SpriteChannelObject", () => {
  describe("constructor", () => {
    it("sets number from the first argument", () => {
      const c = new SpriteChannelObject(3);
      expect(c.number).toBe(3);
    });

    it("defaults number to 0 when omitted", () => {
      const c = new SpriteChannelObject();
      expect(c.number).toBe(0);
    });
  });

  describe("documented defaults", () => {
    it("name, scripted, sprite start at documented defaults", () => {
      const c = new SpriteChannelObject(1);
      expect(c.name).toBe("");
      expect(c.scripted).toBe(false);
      expect(c.sprite).toBeNull();
    });
  });

  describe("makeScriptedSprite()", () => {
    it("stores the member on sprite and flags scripted=true", () => {
      const c = new SpriteChannelObject(1);
      const member = { id: "kite" };
      const result = c.makeScriptedSprite(member);
      expect(result).toBe(member);
      expect(c.sprite).toBe(member);
      expect(c.scripted).toBe(true);
    });

    it("coerces a null member to null sprite", () => {
      const c = new SpriteChannelObject(1);
      const result = c.makeScriptedSprite(null);
      expect(result).toBeNull();
      expect(c.sprite).toBeNull();
      expect(c.scripted).toBe(true);
    });
  });

  describe("removeScriptedSprite()", () => {
    it("reverts sprite and scripted to documented defaults", () => {
      const c = new SpriteChannelObject(1);
      c.makeScriptedSprite({ id: "kite" });
      c.removeScriptedSprite();
      expect(c.sprite).toBeNull();
      expect(c.scripted).toBe(false);
    });

    it("does not clobber number or name", () => {
      const c = new SpriteChannelObject(7);
      c.name = "Kite string";
      c.makeScriptedSprite({});
      c.removeScriptedSprite();
      expect(c.number).toBe(7);
      expect(c.name).toBe("Kite string");
    });
  });

  describe("plain-field surface", () => {
    it("exposes number/name/scripted/sprite as plain own writable fields", () => {
      const c = new SpriteChannelObject(2);
      for (const p of ["number", "name", "scripted", "sprite"]) {
        expect(Object.prototype.hasOwnProperty.call(c, p)).toBe(true);
      }
      c.name = "Background";
      expect(c.name).toBe("Background");
      c.scripted = 1;
      expect(c.scripted).toBe(1);
      c.sprite = { id: 1 };
      expect(c.sprite).toEqual({ id: 1 });
    });

    it("exposes both documented methods on the prototype", () => {
      const c = new SpriteChannelObject(1);
      expect(typeof c.makeScriptedSprite).toBe("function");
      expect(typeof c.removeScriptedSprite).toBe("function");
    });
  });
});