import { describe, it, expect } from "vitest";
import { SoundChannelObject } from "../sound-channel.js";

describe("SoundChannelObject (canon)", () => {
  describe("construction", () => {
    it("constructor(channel) sets the channel field", () => {
      const ch = new SoundChannelObject(2);
      expect(ch.channel).toBe(2);
    });

    it("channel is a plain writable field — no read-only enforcement", () => {
      const ch = new SoundChannelObject(1);
      expect(() => { ch.channel = 9; }).not.toThrow();
      expect(ch.channel).toBe(9);
    });
  });

  describe("documented field defaults", () => {
    it("volume defaults to 0 (no sound queued)", () => {
      expect(new SoundChannelObject(1).volume).toBe(0);
    });

    it("pan defaults to 0 (centered)", () => {
      expect(new SoundChannelObject(1).pan).toBe(0);
    });

    it("loop defaults to false", () => {
      expect(new SoundChannelObject(1).loop).toBe(false);
    });

    it("currentTime defaults to 0", () => {
      expect(new SoundChannelObject(1).currentTime).toBe(0);
    });

    it("elapsedTime defaults to 0", () => {
      expect(new SoundChannelObject(1).elapsedTime).toBe(0);
    });

    it("endTime defaults to 0", () => {
      expect(new SoundChannelObject(1).endTime).toBe(0);
    });

    it("loopCount defaults to 0 (no queued sound)", () => {
      expect(new SoundChannelObject(1).loopCount).toBe(0);
    });

    it("loopEndTime defaults to 0", () => {
      expect(new SoundChannelObject(1).loopEndTime).toBe(0);
    });

    it("loopStartTime defaults to 0", () => {
      expect(new SoundChannelObject(1).loopStartTime).toBe(0);
    });

    it("loopsRemaining defaults to 0 (no loop queued)", () => {
      expect(new SoundChannelObject(1).loopsRemaining).toBe(0);
    });

    it("sampleCount defaults to 0", () => {
      expect(new SoundChannelObject(1).sampleCount).toBe(0);
    });

    it("sampleRate defaults to 0 (no playing sound)", () => {
      expect(new SoundChannelObject(1).sampleRate).toBe(0);
    });

    it("startTime defaults to 0", () => {
      expect(new SoundChannelObject(1).startTime).toBe(0);
    });

    it("status defaults to 0 (Idle)", () => {
      expect(new SoundChannelObject(1).status).toBe(0);
    });

    it("channelCount defaults to 0 (no playing sound)", () => {
      expect(new SoundChannelObject(1).channelCount).toBe(0);
    });

    it("member defaults to null (no sound playing)", () => {
      expect(new SoundChannelObject(1).member).toBeNull();
    });

    it("isPlaying defaults to false", () => {
      expect(new SoundChannelObject(1).isPlaying).toBe(false);
    });
  });

  describe("writable documented fields (no coercion)", () => {
    it("volume is a plain writable field", () => {
      const ch = new SoundChannelObject(1);
      ch.volume = 130;
      expect(ch.volume).toBe(130);
    });

    it("pan is a plain writable field", () => {
      const ch = new SoundChannelObject(1);
      ch.pan = -50;
      expect(ch.pan).toBe(-50);
    });

    it("startTime is a plain writable field (canon: no read-only enforcement)", () => {
      const ch = new SoundChannelObject(1);
      expect(() => { ch.startTime = 100; }).not.toThrow();
      expect(ch.startTime).toBe(100);
    });

    it("elapsedTime is a plain field — no read-only throw", () => {
      const ch = new SoundChannelObject(1);
      expect(() => { ch.elapsedTime = 5; }).not.toThrow();
      expect(ch.elapsedTime).toBe(5);
    });

    it("member is a plain writable field", () => {
      const ch = new SoundChannelObject(1);
      const m = { name: "intro" };
      ch.member = m;
      expect(ch.member).toBe(m);
    });
  });

  describe("default-returning methods", () => {
    it("isBusy() returns false", () => {
      expect(new SoundChannelObject(1).isBusy()).toBe(false);
    });

    it("getPlayList() returns an empty array", () => {
      expect(new SoundChannelObject(1).getPlayList()).toEqual([]);
    });
  });

  describe("no-op stub methods are callable without throwing", () => {
    const ch = new SoundChannelObject(1);
    it.each([
      ["breakLoop", []],
      ["fadeIn", [100]],
      ["fadeOut", [100]],
      ["fadeTo", [150, 100]],
      ["pause", []],
      ["play", []],
      ["playFile", ["Thunder.wav"]],
      ["playNext", []],
      ["queue", [{ name: "x" }]],
      ["rewind", []],
      ["setPlayList", [[]]],
      ["stop", []],
    ])("%s() does not throw", (name, args) => {
      expect(() => ch[name](...args)).not.toThrow();
    });
  });

  describe("surface", () => {
    it("instances expose the documented property fields", () => {
      const ch = new SoundChannelObject(1);
      for (const p of ["channel", "volume", "pan", "loop", "currentTime", "elapsedTime",
        "endTime", "loopCount", "loopEndTime", "loopStartTime", "loopsRemaining", "sampleCount",
        "sampleRate", "startTime", "status", "member", "channelCount", "isPlaying"]) {
        expect(Object.prototype.hasOwnProperty.call(ch, p)).toBe(true);
      }
    });

    it("prototype exposes the documented methods", () => {
      for (const fn of ["breakLoop", "fadeIn", "fadeOut", "fadeTo", "getPlayList", "isBusy",
        "pause", "play", "playFile", "playNext", "queue", "rewind", "setPlayList", "stop"]) {
        expect(typeof SoundChannelObject.prototype[fn]).toBe("function");
      }
    });
  });

  describe("no statics (FR-005)", () => {
    it("has no static registry or reset helpers", () => {
      expect(SoundChannelObject._register).toBeUndefined();
      expect(SoundChannelObject._reset).toBeUndefined();
    });
  });
});