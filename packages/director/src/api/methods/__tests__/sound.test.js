import { describe, it, expect } from "vitest";
import { sound } from "../sound.js";
import { SoundChannelObject } from "../../objects/sound-channel.js";

describe("sound", () => {
  it("is exported as a function", () => {
    expect(typeof sound).toBe("function");
  });

  it("returns a SoundChannelObject instance", () => {
    const ch = sound(1);
    expect(ch).toBeInstanceOf(SoundChannelObject);
  });

  it("exposes the requested channel number", () => {
    const ch = sound(2);
    expect(ch.channel).toBe(2);
  });

  it("returns the same instance for the same channel (idempotent)", () => {
    const a = sound(3);
    const b = sound(3);
    expect(a).toBe(b);
  });

  it("returns distinct instances for different channels", () => {
    const a = sound(1);
    const b = sound(2);
    expect(a).not.toBe(b);
    expect(a.channel).toBe(1);
    expect(b.channel).toBe(2);
  });

  it("coerces a numeric string channel to a number", () => {
    const ch = sound("5");
    expect(ch).toBeInstanceOf(SoundChannelObject);
    expect(ch.channel).toBe(5);
  });

  it("channel is read-only", () => {
    const ch = sound(1);
    expect(() => { ch.channel = 9; }).toThrow();
  });

  it("play() sets isPlaying to true and stores member", () => {
    const ch = sound(1);
    const fakeMember = { name: "waltz1" };
    ch.play(fakeMember);
    expect(ch.isPlaying).toBe(true);
    expect(ch.member).toBe(fakeMember);
  });

  it("stop() sets isPlaying to false and resets currentTime", () => {
    const ch = sound(1);
    ch.play({ name: "x" });
    ch.currentTime = 5;
    ch.stop();
    expect(ch.isPlaying).toBe(false);
    expect(ch.currentTime).toBe(0);
  });

  it("matches the spec example shape (channel has play method)", () => {
    const music = sound(1);
    expect(typeof music.play).toBe("function");
  });
});
