import { describe, it, expect } from "vitest";
import { SpriteChannelObject } from "../sprite-channel-object.js";

describe("SpriteChannelObject", () => {
  describe("constructor", () => {
    it("defaults number to 0", () => {
      const s = new SpriteChannelObject();
      expect(s.number).toBe(0);
    });
    it("accepts a channel number", () => {
      const s = new SpriteChannelObject(3);
      expect(s.number).toBe(3);
    });
  });

  describe("props (read-write)", () => {
    it("name coerces to string", () => {
      const s = new SpriteChannelObject(1);
      s.name = 5;
      expect(s.name).toBe("5");
    });
    it("scripted coerces to boolean", () => {
      const s = new SpriteChannelObject(1);
      s.scripted = 1;
      expect(s.scripted).toBe(true);
    });
    it("sprite is null by default and accepts value", () => {
      const s = new SpriteChannelObject(1);
      expect(s.sprite).toBeNull();
      s.sprite = { id: 1 };
      expect(s.sprite).toEqual({ id: 1 });
    });
  });

  describe("makeScriptedSprite()", () => {
    it("associates a sprite and sets scripted=true", () => {
      const s = new SpriteChannelObject(1);
      const sprite = { id: 1 };
      const result = s.makeScriptedSprite(sprite);
      expect(result).toBe(sprite);
      expect(s.sprite).toBe(sprite);
      expect(s.scripted).toBe(true);
    });

    it("accepts null to clear", () => {
      const s = new SpriteChannelObject(1);
      s.makeScriptedSprite({ id: 1 });
      s.makeScriptedSprite(null);
      expect(s.sprite).toBeNull();
      expect(s.scripted).toBe(true);
    });
  });

  describe("removeScriptedSprite()", () => {
    it("clears sprite and scripted flag", () => {
      const s = new SpriteChannelObject(1);
      s.makeScriptedSprite({ id: 1 });
      s.removeScriptedSprite();
      expect(s.sprite).toBeNull();
      expect(s.scripted).toBe(false);
    });
  });
});
