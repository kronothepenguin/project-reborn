import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../context.js";
import { _score, _movie, _player, _sound, _key, _mouse, _system, _global, _resetSingletons } from "../singletons.js";

describe("DirectorContext — ownership", () => {
  it("owns the seven singletons as instances", () => {
    const ctx = new DirectorContext();
    expect(ctx.movie).toBeDefined();
    expect(ctx.player).toBeDefined();
    expect(ctx.sound).toBeDefined();
    expect(ctx.key).toBeDefined();
    expect(ctx.mouse).toBeDefined();
    expect(ctx.system).toBeDefined();
    expect(ctx.global).toBeDefined();
  });

  it("owns exactly one of each shared subsystem", () => {
    const ctx = new DirectorContext();
    expect(ctx.memberRegistry).toBeDefined();
    expect(ctx.netState).toBeDefined();
    expect(ctx.windowRegistry).toBeDefined();
    expect(ctx.score).toBeDefined();
  });

  it("mirrors the movie definition options", () => {
    const ctx = new DirectorContext({
      name: "habbo",
      src: "/habbo/index.js",
      tempo: 15,
      width: 720,
      height: 480,
    });
    expect(ctx.name).toBe("habbo");
    expect(ctx.src).toBe("/habbo/index.js");
    expect(ctx.tempo).toBe(15);
    expect(ctx.score.tempo).toBe(15);
    expect(ctx.width).toBe(720);
    expect(ctx.height).toBe(480);
    expect(ctx.castLibs).toEqual([]);
  });

  it("freezes externalParams captured at construction", () => {
    const ctx = new DirectorContext({ externalParams: [{ name: "sw1", value: "a" }] });
    expect(Object.isFrozen(ctx.externalParams)).toBe(true);
    expect(ctx.externalParams).toEqual([{ name: "sw1", value: "a" }]);
  });

  it("defaults without options", () => {
    const ctx = new DirectorContext();
    expect(ctx.name).toBe("");
    expect(ctx.src).toBe("");
    expect(ctx.tempo).toBe(30);
    expect(ctx.width).toBe(640);
    expect(ctx.height).toBe(480);
    expect(ctx.externalParams).toEqual([]);
  });
});

describe("DirectorContext — activate dual binding", () => {
  beforeEach(() => _resetSingletons());
  afterEach(() => {
    _resetSingletons();
    delete globalThis._movie;
    delete globalThis._player;
    delete globalThis._sound;
    delete globalThis._key;
    delete globalThis._mouse;
    delete globalThis._system;
    delete globalThis._global;
  });

  it("binds both surfaces to the context instances", () => {
    const ctx = new DirectorContext();
    const g = {};
    ctx.activate(g);
    expect(_movie).toBe(ctx.movie);
    expect(_player).toBe(ctx.player);
    expect(_sound).toBe(ctx.sound);
    expect(_key).toBe(ctx.key);
    expect(_mouse).toBe(ctx.mouse);
    expect(_system).toBe(ctx.system);
    expect(_global).toBe(ctx.global);
    expect(g._movie).toBe(ctx.movie);
    expect(g._player).toBe(ctx.player);
    expect(g._global).toBe(ctx.global);
  });

  it("binds the _score slot to the context score, and does NOT install it on the global", () => {
    const ctx = new DirectorContext();
    const g = {};
    ctx.activate(g);
    expect(_score).toBe(ctx.score);
    expect("_score" in g).toBe(false);
  });

  it("last-activate-wins detaches the first context from both surfaces", () => {
    const a = new DirectorContext({ name: "a" });
    const b = new DirectorContext({ name: "b" });
    a.activate({});
    b.activate({});
    expect(_movie).toBe(b.movie);
    expect(_system).toBe(b.system);
  });
});

describe("DirectorContext — destroy idempotent", () => {
  it("releases resources exactly once and is idempotent", () => {
    const ctx = new DirectorContext();
    const loop = {
      stop: vi.fn(),
      isStopped: false,
      stopWatch: function () {
        this.isStopped = true;
      },
    };
    ctx.eventLoopHandle = loop;
    ctx.audioContext = { close: vi.fn() };
    ctx.canvas = {};

    ctx.destroy();
    ctx.destroy();

    expect(ctx.destroyed).toBe(true);
    expect(ctx.canvas).toBeNull();
    expect(ctx.eventLoopHandle).toBeNull();
    expect(loop.stop).toHaveBeenCalledTimes(1);
    expect(ctx.audioContext.close).toHaveBeenCalledTimes(1);
  });

  it("survives a destroy without resources", () => {
    const ctx = new DirectorContext();
    expect(() => ctx.destroy()).not.toThrow();
    expect(ctx.destroyed).toBe(true);
  });
});

describe("DirectorContext — EventTarget surface", () => {
  it("dispatches lifecycle events on itself; unsubscribe works; no cross-context leak", () => {
    const a = new DirectorContext();
    const b = new DirectorContext();
    const seen = [];
    const onFrame = (e) => seen.push(["a", e.detail?.movie === a.movie ? a.name : "?"]);
    a.addEventListener("enterFrame", onFrame);
    a.prepareFrame();
    expect(seen.length).toBe(0);
    a.enterFrame();
    expect(seen.length).toBe(1);
    a.removeEventListener("enterFrame", onFrame);
    a.enterFrame();
    expect(seen.length).toBe(1);
    b.enterFrame();
    expect(seen.length).toBe(1);
  });
});