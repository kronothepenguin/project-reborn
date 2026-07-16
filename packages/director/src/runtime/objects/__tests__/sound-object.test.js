import { describe, it, expect, beforeEach, vi } from "vitest";
import { SoundObject } from "../sound.js";
import { _sound  } from "../../singletons.js";
import { SoundChannelObject } from "../sound-channel.js";

describe("SoundObject", () => {
  describe("singleton", () => {
    it("_sound is instance of SoundObject", () => {
      expect(_sound).toBeInstanceOf(SoundObject);
    });
  });

  describe("soundEnabled (read-write)", () => {
    beforeEach(() => { _sound.soundEnabled = true; });
    it("coerces to boolean", () => {
      _sound.soundEnabled = 0; expect(_sound.soundEnabled).toBe(false);
      _sound.soundEnabled = 1; expect(_sound.soundEnabled).toBe(true);
    });
  });

  describe("Chapter-5 new device props", () => {
    it("soundDevice/soundDeviceList/soundKeepDevice/soundLevel/soundMixMedia", () => {
      _sound.soundDevice = "dev"; expect(_sound.soundDevice).toBe("dev");
      _sound.soundDeviceList = ["a", "b"]; expect(_sound.soundDeviceList).toEqual(["a", "b"]);
      _sound.soundKeepDevice = false; expect(_sound.soundKeepDevice).toBe(false);
      _sound.soundLevel = 128; expect(_sound.soundLevel).toBe(128);
      _sound.soundMixMedia = false; expect(_sound.soundMixMedia).toBe(false);
    });
    it("soundDeviceList coerces non-array to []", () => {
      _sound.soundDeviceList = "x";
      expect(_sound.soundDeviceList).toEqual([]);
    });
  });

  describe("beep()", () => {
    let mockCtx;
    let mockOsc;
    let mockGain;
    beforeEach(() => {
      _sound.soundEnabled = true;
      mockOsc = {
        connect: vi.fn(), start: vi.fn(), stop: vi.fn(),
        frequency: { value: 0 }, type: "", onended: null,
      };
      mockGain = { connect: vi.fn(), gain: { value: 0 } };
      mockCtx = {
        createOscillator: vi.fn().mockReturnValue(mockOsc),
        createGain: vi.fn().mockReturnValue(mockGain),
        destination: {}, currentTime: 0, close: vi.fn(),
      };
      globalThis.AudioContext = vi.fn(function() { return mockCtx; });
    });
    it("plays a beep with default frequency 800", () => {
      _sound.beep();
      expect(mockOsc.frequency.value).toBe(800);
      expect(mockOsc.type).toBe("square");
    });
    it("does not beep when disabled", () => {
      _sound.soundEnabled = false;
      _sound.beep();
      expect(globalThis.AudioContext).not.toHaveBeenCalled();
    });
    it("is no-op when no AudioContext is available", () => {
      delete globalThis.AudioContext;
      expect(() => _sound.beep()).not.toThrow();
    });
  });

  describe("channel() factory", () => {
    it("returns SoundChannelObject, idempotent per channel number", () => {
      const a = _sound.channel(1);
      expect(a).toBeInstanceOf(SoundChannelObject);
      const b = _sound.channel(1);
      expect(a).toBe(b);
    });
    it("returns distinct instances per channel", () => {
      const a = _sound.channel(1);
      const b = _sound.channel(2);
      expect(a).not.toBe(b);
    });
    it("coerces string channel to number", () => {
      const c = _sound.channel("5");
      expect(c.channel).toBe(5);
    });
  });
});
