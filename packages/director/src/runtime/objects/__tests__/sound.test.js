import { describe, it, expect } from "vitest";
import { SoundObject } from "../sound.js";
import { SoundChannelObject } from "../sound-channel.js";

describe("SoundObject (canon)", () => {
  describe("documented field defaults", () => {
    it("soundEnabled defaults to true (TRUE, default)", () => {
      expect(new SoundObject().soundEnabled).toBe(true);
    });

    it("soundKeepDevice defaults to true", () => {
      expect(new SoundObject().soundKeepDevice).toBe(true);
    });

    it("soundLevel defaults to 7 (maximum, default)", () => {
      expect(new SoundObject().soundLevel).toBe(7);
    });

    it("soundMixMedia defaults to true", () => {
      expect(new SoundObject().soundMixMedia).toBe(true);
    });

    it("soundDevice defaults to an empty string", () => {
      expect(new SoundObject().soundDevice).toBe("");
    });

    it("soundDeviceList defaults to an empty array", () => {
      expect(new SoundObject().soundDeviceList).toEqual([]);
    });
  });

  describe("writable documented fields (no coercion)", () => {
    it("soundEnabled is a plain writable field", () => {
      const s = new SoundObject();
      s.soundEnabled = false;
      expect(s.soundEnabled).toBe(false);
    });

    it("soundKeepDevice is a plain writable field", () => {
      const s = new SoundObject();
      s.soundKeepDevice = false;
      expect(s.soundKeepDevice).toBe(false);
    });

    it("soundLevel is a plain writable field", () => {
      const s = new SoundObject();
      s.soundLevel = 5;
      expect(s.soundLevel).toBe(5);
    });

    it("soundMixMedia is a plain writable field", () => {
      const s = new SoundObject();
      s.soundMixMedia = false;
      expect(s.soundMixMedia).toBe(false);
    });

    it("soundDevice is a plain writable field", () => {
      const s = new SoundObject();
      s.soundDevice = "MacroMix";
      expect(s.soundDevice).toBe("MacroMix");
    });

    it("soundDeviceList is a plain writable field", () => {
      const s = new SoundObject();
      s.soundDeviceList = ["MacroMix", "QT3Mix"];
      expect(s.soundDeviceList).toEqual(["MacroMix", "QT3Mix"]);
    });
  });

  describe("beep()", () => {
    it("is a no-op callable that does not throw", () => {
      const s = new SoundObject();
      expect(() => s.beep()).not.toThrow();
    });

    it("accepts an optional intBeepCount without throwing", () => {
      const s = new SoundObject();
      expect(() => s.beep(2)).not.toThrow();
    });
  });

  describe("channel()", () => {
    it("returns a SoundChannelObject constructed with the channel number", () => {
      const s = new SoundObject();
      const ch = s.channel(3);
      expect(ch).toBeInstanceOf(SoundChannelObject);
      expect(ch.channel).toBe(3);
    });

    it("constructs a fresh instance per call (v1 stub)", () => {
      const s = new SoundObject();
      const a = s.channel(1);
      const b = s.channel(1);
      expect(a).not.toBe(b);
    });
  });

  describe("surface", () => {
    it("prototype exposes beep and channel methods", () => {
      expect(typeof SoundObject.prototype.beep).toBe("function");
      expect(typeof SoundObject.prototype.channel).toBe("function");
    });

    it("instances expose the documented property fields", () => {
      const s = new SoundObject();
      for (const p of ["soundDevice", "soundDeviceList", "soundEnabled", "soundKeepDevice",
        "soundLevel", "soundMixMedia"]) {
        expect(Object.prototype.hasOwnProperty.call(s, p)).toBe(true);
      }
    });
  });

  describe("no statics (FR-005)", () => {
    it("has no static registry or reset helpers", () => {
      expect(SoundObject._register).toBeUndefined();
      expect(SoundObject._reset).toBeUndefined();
    });
  });
});