import { describe, it, expect } from "vitest";
import { Score, STAGE } from "../score.js";

const cell = (overrides = {}) => ({ member: "m1", ...overrides });

describe("Score — construction and normalization", () => {
  it("normalizes a frames array into { marker, channels }", () => {
    const s = new Score({ frames: [{ marker: "start", channels: { 1: cell({ placement: "a" }) } }] });
    expect(s.frames.length).toBe(1);
    expect(s.frames[0].marker).toBe("start");
    expect(s.frames[0].channels.get(1)).toEqual({ member: "m1", placement: "a" });
  });

  it("accepts the array channel form (index + 1 = channel)", () => {
    const s = new Score({ frames: [{ channels: [null, cell({ who: "x" })] }] });
    expect(s.frames[0].channels.get(2)).toEqual({ member: "m1", who: "x" });
  });

  it("drops channels beyond 48 (truncation)", () => {
    const channels = {};
    for (let i = 1; i <= 50; i++) channels[i] = cell();
    const s = new Score({ frames: [{ channels }] });
    expect(s.frames[0].channels.get(48)).toBeDefined();
    expect(s.frames[0].channels.get(50)).toBeUndefined();
  });

  it("keeps markerless frames as marker undefined", () => {
    const s = new Score({ frames: [{ channels: {} }] });
    expect(s.frames[0].marker).toBeUndefined();
  });

  it("defaults tempo to 30", () => {
    expect(new Score().tempo).toBe(30);
    expect(new Score({ tempo: 15 }).tempo).toBe(15);
  });
});

describe("Score — playhead", () => {
  const three = () => new Score({ frames: [{}, {}, {}] });

  it("reads frame 0 with no frames, 1 at the first frame", () => {
    expect(new Score().frame).toBe(0);
    const s = three();
    s.advance();
    expect(s.frame).toBe(1);
  });

  it("advance() steps and clamps at the last frame (hold)", () => {
    const s = three();
    s.advance();
    s.advance();
    s.advance();
    expect(s.frame).toBe(3);
    s.advance();
    expect(s.frame).toBe(3);
  });

  it("advance() no-ops on an empty score", () => {
    const s = new Score();
    s.advance();
    expect(s.frame).toBe(0);
  });
});

describe("Score — tempo", () => {
  it("setTempo mutates the live tempo", () => {
    const s = new Score({ tempo: 30 });
    s.setTempo(60);
    expect(s.tempo).toBe(60);
  });

  it("clamps to at least 1 and floors non-integers", () => {
    const s = new Score();
    s.setTempo(0);
    expect(s.tempo).toBe(1);
    s.setTempo(-5);
    expect(s.tempo).toBe(1);
    s.setTempo(30.9);
    expect(s.tempo).toBe(30);
  });
});

describe("Score — navigation (R6)", () => {
  const marked = () =>
    new Score({
      frames: [
        { marker: "alpha", channels: {} },
        { channels: {} },
        { marker: "beta", channels: {} },
        { marker: "gamma", channels: {} },
      ],
    });

  it("go(n) clamps to the frame range", () => {
    const s = marked();
    s.go(5);
    expect(s.frame).toBe(4);
    s.go(0);
    expect(s.frame).toBe(1);
  });

  it("go('name') jumps to the first frame with that marker", () => {
    const s = marked();
    s.go("beta");
    expect(s.frame).toBe(3);
    s.go("alpha");
    expect(s.frame).toBe(1);
  });

  it("go('unknown') is a no-op", () => {
    const s = marked();
    s.advance();
    s.advance();
    s.go("nope");
    expect(s.frame).toBe(2);
  });

  it("go() on an empty score no-ops", () => {
    const s = new Score();
    s.go(2);
    expect(s.frame).toBe(0);
    s.go("x");
    expect(s.frame).toBe(0);
  });

  it("goNext jumps to the next marker; none right → last marker; no markers → frame 1", () => {
    const s = marked();
    s.go("alpha");
    s.goNext();
    expect(s.frame).toBe(3);
    s.goNext();
    expect(s.frame).toBe(4);
    s.goNext();
    expect(s.frame).toBe(4);

    const bare = new Score({ frames: [{}, {}, {}] });
    bare.advance();
    bare.goNext();
    expect(bare.frame).toBe(1);
  });

  it("goPrevious jumps one marker back from a marker frame, two back from a markerless frame", () => {
    const s = marked();
    s.advance(); // frame 1 (alpha)
    s.advance(); // frame 2 (markerless)
    s.advance(); // frame 3 (beta)
    s.goPrevious();
    expect(s.frame).toBe(1); // current has marker (beta) → one back → alpha

    s.go("gamma"); // frame 4 (marker)
    s.goPrevious();
    expect(s.frame).toBe(3); // current has marker (gamma) → one back → beta

    // markerless frame 2: two-back target needs 2 markers left; only α(1) is —
// clamped to the leftmost available marker (docs' fallback clause is for
// "no markers to the left", which does not apply here).
    s.go(2);
    s.goPrevious();
    expect(s.frame).toBe(1);
  });

  it("goLoop jumps to the previous marker; falls back per docs when none left", () => {
    const s = marked();
    s.go("beta");
    s.goLoop();
    expect(s.frame).toBe(1); // alpha

    const bare = new Score({ frames: [{}, {}, {}] });
    bare.advance();
    bare.goLoop();
    expect(bare.frame).toBe(1);
  });
});

describe("Score — channels", () => {
  const populated = () =>
    new Score({ frames: [{ channels: { 1: cell(), 5: cell({ loc: [10, 20] }) } }] });
  const marked = () =>
    new Score({
      frames: [
        { marker: "alpha", channels: {} },
        { channels: {} },
        { marker: "beta", channels: {} },
        { marker: "gamma", channels: {} },
      ],
    });

  it("channel(n) reads the current frame's cell, or null", () => {
    const s = populated();
    s.advance();
    expect(s.channel(1)).toEqual({ member: "m1" });
    expect(s.channel(5)).toEqual({ member: "m1", loc: [10, 20] });
    expect(s.channel(2)).toBeNull();
  });

  it("channel(0) resolves to the stage", () => {
    const s = new Score();
    expect(s.channel(0)).toBe(STAGE);
  });

  it("populatedChannels() returns ascending populated channel numbers", () => {
    const s = populated();
    s.advance();
    expect(s.populatedChannels()).toEqual([1, 5]);
  });

  it("populatedChannels() is empty on an empty score", () => {
    expect(new Score().populatedChannels()).toEqual([]);
  });

  it("markers() derives the { marker, frame } index on demand", () => {
    const s = marked();
    expect(s.markers()).toEqual([
      { marker: "alpha", frame: 1 },
      { marker: "beta", frame: 3 },
      { marker: "gamma", frame: 4 },
    ]);
  });
});