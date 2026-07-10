import { describe, it, expect, beforeEach } from "vitest";
import { SoundChannelObject } from "../sound-channel-object.js";
import { _sound } from "../sound-object.js";

describe("SoundChannelObject", () => {
  let ch;
  beforeEach(() => {
    ch = new SoundChannelObject(1);
  });

  describe("channel (read-only)", () => {
    it("throws on set", () => {
      expect(() => { ch.channel = 9; }).toThrow();
    });
  });

  describe("volume/pan/loop/currentTime", () => {
    it("volume coerces to number", () => {
      ch.volume = "100";
      expect(ch.volume).toBe(100);
    });
    it("pan defaults to 0", () => {
      expect(ch.pan).toBe(0);
    });
    it("loop coerces to boolean", () => {
      ch.loop = 1; expect(ch.loop).toBe(true);
    });
    it("currentTime coerces to number", () => {
      ch.currentTime = "5";
      expect(ch.currentTime).toBe(5);
    });
  });

  describe("playback", () => {
    it("play sets isPlaying and member", () => {
      const m = { name: "w" };
      ch.play(m);
      expect(ch.isPlaying).toBe(true);
      expect(ch.member).toBe(m);
      expect(ch.status).toBe(1);
    });
    it("stop resets state", () => {
      ch.play({}); ch.stop();
      expect(ch.isPlaying).toBe(false);
      expect(ch.currentTime).toBe(0);
      expect(ch.status).toBe(0);
    });
    it("pause sets status 2 when playing", () => {
      ch.play({}); ch.pause();
      expect(ch.isPlaying).toBe(false);
      expect(ch.status).toBe(2);
    });
    it("pause is no-op when not playing", () => {
      ch.pause();
      expect(ch.status).toBe(0);
    });
    it("rewind resets time", () => {
      ch.currentTime = 5; ch.rewind();
      expect(ch.currentTime).toBe(0);
    });
    it("breakLoop disables loop + resets remaining", () => {
      ch.loop = true; ch.breakLoop();
      expect(ch.loop).toBe(false);
    });
  });

  describe("Chapter-5 new methods", () => {
    it("fadeIn/fadeOut/fadeTo return true", () => {
      expect(ch.fadeIn(100)).toBe(true);
      expect(ch.fadeOut(100)).toBe(true);
      expect(ch.fadeTo(128, 100)).toBe(true);
    });
    it("getPlayList returns a snapshot", () => {
      ch.queue({ id: 1 });
      const list = ch.getPlayList();
      expect(list).toEqual([{ id: 1 }]);
    });
    it("setPlayList accepts array", () => {
      ch.setPlayList([1, 2]);
      expect(ch.getPlayList()).toEqual([1, 2]);
    });
    it("setPlayList coerces non-array to []", () => {
      ch.setPlayList("x");
      expect(ch.getPlayList()).toEqual([]);
    });
    it("isBusy mirrors isPlaying", () => {
      expect(ch.isBusy()).toBe(false);
      ch.play({}); expect(ch.isBusy()).toBe(true);
    });
    it("playFile starts playback", () => {
      ch.playFile("a.wav");
      expect(ch.isPlaying).toBe(true);
    });
    it("playNext returns null", () => {
      expect(ch.playNext()).toBeNull();
    });
    it("queue appends to internal playList", () => {
      ch.queue({ id: 1 });
      ch.queue({ id: 2 });
      expect(ch.getPlayList().length).toBe(2);
    });
  });

  describe("Chapter-5 new props", () => {
    it("defaults and coercion", () => {
      expect(ch.elapsedTime).toBe(0);
      expect(() => { ch.elapsedTime = 5; }).toThrow();
      expect(ch.startTime).toBe(0);
      ch.startTime = 100; expect(ch.startTime).toBe(100);
      expect(ch.endTime).toBe(0);
      ch.endTime = 200; expect(ch.endTime).toBe(200);
      expect(ch.loopCount).toBe(0);
      ch.loopCount = 3; expect(ch.loopCount).toBe(3);
      expect(ch.loopStartTime).toBe(0);
      ch.loopStartTime = 10; expect(ch.loopStartTime).toBe(10);
      expect(ch.loopEndTime).toBe(0);
      ch.loopEndTime = 50; expect(ch.loopEndTime).toBe(50);
      expect(ch.loopsRemaining).toBe(0);
      ch.loopsRemaining = 2; expect(ch.loopsRemaining).toBe(2);
      expect(ch.sampleCount).toBe(0);
      ch.sampleCount = 1000; expect(ch.sampleCount).toBe(1000);
      expect(ch.sampleRate).toBe(44100);
      ch.sampleRate = 22050; expect(ch.sampleRate).toBe(22050);
      expect(ch.channelCount).toBe(1);
      ch.channelCount = 2; expect(ch.channelCount).toBe(2);
      expect(ch.status).toBe(0);
      ch.status = 1; expect(ch.status).toBe(1);
    });
  });
});
