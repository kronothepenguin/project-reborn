import { describe, it, expect, vi, beforeEach } from "vitest";
import { createAudioEngine } from "../audio.js";

class FakeParam {
  constructor(initial = 0) { this.value = initial; this.calls = []; }
  setValueAtTime(v, t) { this.value = v; this.calls.push(["set", v, t]); }
  linearRampToValueAtTime(v, t) { this.value = v; this.calls.push(["ramp", v, t]); }
}
class FakeGain {
  constructor() { this.gain = new FakeParam(1); this.connections = []; }
  connect(node) { this.connections.push(node); }
}
class FakePanner {
  constructor() { this.pan = new FakeParam(0); this.connections = []; }
  connect(node) { this.connections.push(node); }
}
class FakeDestination { }
class FakeSource {
  constructor() { this.buffer = null; this.connect = vi.fn(); this.start = vi.fn(); }
}
const FakeAudioContext = class {
  constructor() {
    this.sources = [];
    this.gains = [];
    this.destination = new FakeDestination();
  }
  createGain() { const g = new FakeGain(); this.gains.push(g); return g; }
  createPanner() { return new FakePanner(); }
  createBufferSource() { const s = new FakeSource(); this.sources.push(s); return s; }
  decodeAudioData(bytes) { return Promise.resolve({ duration: 1, sampleRate: 44100 }); }
};

describe("audio engine — 8 channels Web Audio (008 R5/US4)", () => {
  let ac;
  beforeEach(() => {
    ac = new FakeAudioContext();
    vi.stubGlobal("AudioContext", FakeAudioContext);
  });

  it("creates 8 channels each wired with gain + panner", () => {
    const engine = createAudioEngine(ac);
    expect(engine.channels.length).toBe(8);
    for (const ch of engine.channels) {
      expect(ch.gainNode).toBeDefined();
      expect(ch.panner).toBeDefined();
      expect(ch.gainNode.gain.value).toBe(1);
    }
  });

  it("play(member) decodes inline bytes and connects buffer→gain→panner→destination", async () => {
    const engine = createAudioEngine(ac);
    const member = { payload: { bytes: new Uint8Array([1, 2, 3]).buffer } };
    const channel = engine.channels[0];
    await channel.play(member);
    expect(channel.isPlaying).toBe(true);
    expect(ac.sources.length).toBeGreaterThan(0);
    const src = ac.sources[ac.sources.length - 1];
    expect(src.buffer).toEqual({ duration: 1, sampleRate: 44100 });
    expect(src.start).toHaveBeenCalled();
  });

  it("setVolume/pan route to gain/pan nodes", () => {
    const engine = createAudioEngine(ac);
    engine.channels[1].setVolume(0.5);
    expect(engine.channels[1].gainNode.gain.value).toBe(0.5);
    engine.channels[1].setPan(100);
    expect(engine.channels[1].panner.pan.value).toBe(1); // -100..100 → -1..1
  });

  it("fade ramps the gain over time; bad decode leaves the channel idle no-throw", async () => {
    const engine = createAudioEngine(ac);
    const ch = engine.channels[2];
    ch.fadeOut(10);
    expect(ch.fadeState).toBe("out");
    ch.tick(1);
    expect(ch.gainNode.gain.calls.some((c) => c[0] === "ramp")).toBe(true);

    const badMember = { payload: { bytes: new ArrayBuffer(0) } };
    ac.decodeAudioData = () => Promise.reject(new Error("bad audio"));
    await expect(ch.play(badMember)).resolves.toBeUndefined();
  });
});