import { describe, it, expect, afterEach, vi } from "vitest";
import { DirectorContext } from "../context.js";
import {
  _movie,
  _player,
  _sound,
  _key,
  _mouse,
  _system,
  _global,
  _resetSingletons,
} from "../singletons.js";
import { MovieObject } from "../objects/movie.js";
import { PlayerObject } from "../objects/player.js";
import { SoundObject } from "../objects/sound.js";
import { KeyObject } from "../objects/key.js";
import { MouseObject } from "../objects/mouse.js";
import { SystemObject } from "../objects/system.js";
import { GlobalObject } from "../objects/global.js";
import { MemberRegistry } from "../subsystems/member-registry.js";
import { NetState } from "../subsystems/net-state.js";
import { WindowRegistry } from "../subsystems/window-registry.js";
import { beep } from "../methods/beep.js";

afterEach(() => {
  _resetSingletons();
});

describe("DirectorContext / construction", () => {
  it("instantiates fresh singletons owned by the context", () => {
    const ctx = new DirectorContext({ name: "test-movie" });
    expect(ctx.movie).toBeInstanceOf(MovieObject);
    expect(ctx.player).toBeInstanceOf(PlayerObject);
    expect(ctx.sound).toBeInstanceOf(SoundObject);
    expect(ctx.key).toBeInstanceOf(KeyObject);
    expect(ctx.mouse).toBeInstanceOf(MouseObject);
    expect(ctx.system).toBeInstanceOf(SystemObject);
    expect(ctx.global).toBeInstanceOf(GlobalObject);
    expect(ctx.name).toBe("test-movie");
  });

  it("mirrors definition-shaped options with documented defaults", () => {
    const ctx = new DirectorContext();
    expect(ctx.tempo).toBe(30);
    expect(ctx.width).toBe(640);
    expect(ctx.height).toBe(480);
    expect(ctx.src).toBe("");
  });

  it("does NOT mutate the singleton slots until activate() is called", () => {
    const original = _movie;
    const ctx = new DirectorContext({ name: "isolated" });
    expect(_movie).toBe(original);
    expect(ctx.movie).not.toBe(original);
  });

  it("exposes per-subsystem instances (FR-004/FR-033/FR-036)", () => {
    const ctx = new DirectorContext();
    expect(ctx.memberRegistry).toBeInstanceOf(MemberRegistry);
    expect(ctx.netState).toBeInstanceOf(NetState);
    expect(ctx.windowRegistry).toBeInstanceOf(WindowRegistry);
  });

  it("exposes the audioContext / canvas / externalParams fields with documented defaults", () => {
    const ctx = new DirectorContext();
    expect(ctx.audioContext).toBeNull();
    expect(ctx.canvas).toBeNull();
    expect(ctx.eventLoopHandle).toBeNull();
    expect(ctx.externalParams).toEqual([]);
  });

  it("freezes externalParams into a snapshot", () => {
    const params = [{ name: "wmode", value: "opaque" }];
    const ctx = new DirectorContext({ externalParams: params });
    expect(Object.isFrozen(ctx.externalParams)).toBe(true);
    expect(ctx.externalParams).toEqual([{ name: "wmode", value: "opaque" }]);
    // Mutating the caller's array MUST NOT leak into the context (FR-035).
    params.push({ name: "late", value: "x" });
    expect(ctx.externalParams).toHaveLength(1);
  });
});

describe("DirectorContext / activate()", () => {
  it("writes the context's instances into the singleton live-binding slots", () => {
    const ctx = new DirectorContext({ name: "active" });
    ctx.activate();
    expect(_movie).toBe(ctx.movie);
    expect(_player).toBe(ctx.player);
    expect(_sound).toBe(ctx.sound);
    expect(_key).toBe(ctx.key);
    expect(_mouse).toBe(ctx.mouse);
    expect(_system).toBe(ctx.system);
    expect(_global).toBe(ctx.global);
  });

  it("writes singletons onto a provided globalThis (FR-027)", () => {
    const ctx = new DirectorContext({ name: "globalized" });
    const sandbox = {};
    ctx.activate(sandbox);
    expect(sandbox._movie).toBe(ctx.movie);
    expect(sandbox._player).toBe(ctx.player);
    expect(sandbox._sound).toBe(ctx.sound);
    expect(sandbox._key).toBe(ctx.key);
    expect(sandbox._mouse).toBe(ctx.mouse);
    expect(sandbox._system).toBe(ctx.system);
    expect(sandbox._global).toBe(ctx.global);
  });

  it("returns the context for chaining", () => {
    const ctx = new DirectorContext();
    expect(ctx.activate()).toBe(ctx);
  });
});

describe("DirectorContext / per-context isolation (SC-002)", () => {
  it("switching active contexts reroutes method calls to the new context's singletons", () => {
    const ctxA = new DirectorContext({ name: "A" });
    const ctxB = new DirectorContext({ name: "B" });

    ctxA.activate();
    const beepSpyA = (_sound.beep = vi.fn(() => {}));

    ctxB.activate();
    const beepSpyB = (_sound.beep = vi.fn(() => {}));

    beep();
    expect(beepSpyB).toHaveBeenCalledTimes(1);
    expect(beepSpyA).not.toHaveBeenCalled();
  });

  it("two contexts own independent registry instances", () => {
    const ctxA = new DirectorContext();
    const ctxB = new DirectorContext();
    expect(ctxA.memberRegistry).not.toBe(ctxB.memberRegistry);
    expect(ctxA.netState).not.toBe(ctxB.netState);
    expect(ctxA.windowRegistry).not.toBe(ctxB.windowRegistry);
  });
});

describe("DirectorContext / destroy()", () => {
  it("stops the event-loop handle when present", () => {
    const stop = vi.fn();
    const ctx = new DirectorContext();
    ctx.eventLoopHandle = { stop };
    ctx.destroy();
    expect(stop).toHaveBeenCalledTimes(1);
    expect(ctx.eventLoopHandle).toBeNull();
    expect(ctx.destroyed).toBe(true);
  });

  it("closes the AudioContext when present", () => {
    const close = vi.fn();
    const ctx = new DirectorContext();
    ctx.audioContext = { close };
    ctx.destroy();
    expect(close).toHaveBeenCalledTimes(1);
  });

  it("is idempotent", () => {
    const close = vi.fn();
    const ctx = new DirectorContext();
    ctx.audioContext = { close };
    ctx.destroy();
    ctx.destroy();
    expect(close).toHaveBeenCalledTimes(1);
    expect(ctx.destroyed).toBe(true);
  });
});