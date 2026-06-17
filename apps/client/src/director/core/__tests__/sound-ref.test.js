import { describe, it, expect, beforeEach, vi } from "vitest";
import { SoundRef, _sound } from "../sound-ref.js";

describe("SoundRef", () => {
  describe("singleton", () => {
    it("_sound is instance of SoundRef", () => {
      expect(_sound).toBeInstanceOf(SoundRef);
    });

    it("_sound is same reference on multiple imports", async () => {
      const { _sound: sound2 } = await import("../sound-ref.js");
      expect(sound2).toBe(_sound);
    });
  });

  describe("soundEnabled property (read-write)", () => {
    beforeEach(() => {
      _sound.soundEnabled = true;
    });

    it("defaults to true", () => {
      const s = new SoundRef();
      expect(s.soundEnabled).toBe(true);
    });

    it("sets soundEnabled to false", () => {
      _sound.soundEnabled = false;
      expect(_sound.soundEnabled).toBe(false);
    });

    it("sets soundEnabled to true", () => {
      _sound.soundEnabled = false;
      _sound.soundEnabled = true;
      expect(_sound.soundEnabled).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      _sound.soundEnabled = 0;
      expect(_sound.soundEnabled).toBe(false);
      _sound.soundEnabled = 1;
      expect(_sound.soundEnabled).toBe(true);
    });
  });

  describe("beep() method", () => {
    let mockCtx;
    let mockOscillator;
    let mockGain;

    beforeEach(() => {
      _sound.soundEnabled = true;
      mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: "",
        onended: null,
      };
      mockGain = {
        connect: vi.fn(),
        gain: { value: 0 },
      };
      mockCtx = {
        createOscillator: vi.fn().mockReturnValue(mockOscillator),
        createGain: vi.fn().mockReturnValue(mockGain),
        destination: {},
        currentTime: 0,
        close: vi.fn(),
      };
      globalThis.AudioContext = vi.fn(function() { return mockCtx; });
    });

    it("creates AudioContext and plays beep", () => {
      _sound.beep();
      expect(globalThis.AudioContext).toHaveBeenCalled();
      expect(mockCtx.createOscillator).toHaveBeenCalled();
      expect(mockCtx.createGain).toHaveBeenCalled();
      expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
      expect(mockGain.connect).toHaveBeenCalledWith(mockCtx.destination);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();
    });

    it("does not beep when soundEnabled is false", () => {
      _sound.soundEnabled = false;
      _sound.beep();
      expect(globalThis.AudioContext).not.toHaveBeenCalled();
    });

    it("sets oscillator frequency to 800", () => {
      _sound.beep();
      expect(mockOscillator.frequency.value).toBe(800);
    });

    it("sets oscillator type to square", () => {
      _sound.beep();
      expect(mockOscillator.type).toBe("square");
    });
  });
});
