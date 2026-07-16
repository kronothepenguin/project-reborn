import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../context.js";
import { _movie, _player, _sound, _key, _mouse, _system, _global, _resetSingletons } from "../singletons.js";
import { MovieObject } from "../objects/movie.js";
import { PlayerObject } from "../objects/player.js";
import { SoundObject } from "../objects/sound.js";
import { CastLibraryObject } from "../objects/cast-library.js";
import { WindowObject } from "../objects/window.js";
import { beep } from "../methods/beep.js";

describe("DirectorContext", () => {
  afterEach(() => {
    _resetSingletons();
    CastLibraryObject._reset();
    WindowObject._reset();
  });

  describe("construction", () => {
    it("instantiates fresh singleton objects owned by the context", () => {
      const ctx = new DirectorContext({ name: "test-movie" });
      expect(ctx.movie).toBeInstanceOf(MovieObject);
      expect(ctx.player).toBeInstanceOf(PlayerObject);
      expect(ctx.sound).toBeInstanceOf(SoundObject);
      expect(ctx.name).toBe("test-movie");
    });

    it("does not mutate the singleton slots until activate() is called", () => {
      const original = _movie;
      const ctx = new DirectorContext({ name: "isolated" });
      expect(_movie).toBe(original);
      expect(ctx.movie).not.toBe(original);
    });
  });

  describe("activate()", () => {
    it("installs the context's instances into the singleton slots", () => {
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

    it("resets the CastLibraryObject static registry", () => {
      const lib = new CastLibraryObject({ number: 1, name: "Internal" });
      CastLibraryObject._register(lib);
      expect(CastLibraryObject.castLib[1]).toBe(lib);
      new DirectorContext().activate();
      expect(CastLibraryObject.castLib[1]).toBeNull();
    });

    it("resets the WindowObject static registry", () => {
      const win = new WindowObject("main");
      expect(WindowObject.windowList).toHaveLength(1);
      new DirectorContext().activate();
      expect(WindowObject.windowList).toHaveLength(0);
    });
  });

  describe("per-context isolation", () => {
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
  });

  describe("destroy()", () => {
    it("clears the event loop handle", () => {
      const stop = vi.fn();
      const ctx = new DirectorContext();
      ctx.eventLoopHandle = { stop };
      ctx.destroy();
      expect(stop).toHaveBeenCalledTimes(1);
      expect(ctx.eventLoopHandle).toBeNull();
      expect(ctx.destroyed).toBe(true);
    });
  });
});