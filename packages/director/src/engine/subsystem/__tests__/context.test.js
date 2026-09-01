import { describe, it, expect, vi, afterEach } from "vitest";
import { DirectorContext } from "../context.js";
import { _getMovie, _getPlayer, _getSound, _getKey, _getMouse, _getSystem, _getGlobal } from "../singletons.js";
import { getActiveDirectorContext, setActiveDirectorContext } from "../accessor.js";

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

describe("DirectorContext — activate sets the active context (006 C8)", () => {
  afterEach(() => {
    setActiveDirectorContext(null);
  });

  it("activate() makes the facade resolve this context's core-object consts", () => {
    const ctx = new DirectorContext();
    ctx.activate();
    expect(getActiveDirectorContext()).toBe(ctx);
    expect(_getMovie()).toBe(ctx.movie);
    expect(_getPlayer()).toBe(ctx.player);
    expect(_getSound()).toBe(ctx.sound);
    expect(_getKey()).toBe(ctx.key);
    expect(_getMouse()).toBe(ctx.mouse);
    expect(_getSystem()).toBe(ctx.system);
    expect(_getGlobal()).toBe(ctx.global);
  });

  it("does NOT install anything on globalThis (no _movie/_score globals)", () => {
    const ctx = new DirectorContext();
    ctx.activate();
    expect(globalThis._movie).toBeUndefined();
    expect(globalThis._score).toBeUndefined();
  });

  it("last-activate-wins; destroy() clears the pointer", () => {
    const a = new DirectorContext({ name: "a" });
    const b = new DirectorContext({ name: "b" });
    a.activate();
    b.activate();
    expect(getActiveDirectorContext()).toBe(b);
    b.destroy();
    expect(getActiveDirectorContext()).toBeNull();
    a.destroy();
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