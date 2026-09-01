import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  _movie,
  _player,
  _sound,
  _key,
  _mouse,
  _system,
  _global,
  _score,
  _installSingletons,
  _resetSingletons,
} from "../singletons.js";
import { DirectorContext } from "../context.js";

describe("singletons — live binding slots", () => {
  beforeEach(() => _resetSingletons());
  afterEach(() => _resetSingletons());

  it("exposes default instances without any context", () => {
    expect(_movie).toBeDefined();
    expect(_player).toBeDefined();
    expect(_sound).toBeDefined();
    expect(_key).toBeDefined();
    expect(_mouse).toBeDefined();
    expect(_system).toBeDefined();
    expect(_global).toBeDefined();
    expect(_score).toBeDefined();
  });

  it("_installSingletons(ctx) rebinds all eight slots to the context's instances", () => {
    const ctx = new DirectorContext({ name: "act" });
    _installSingletons(ctx);
    expect(_movie).toBe(ctx.movie);
    expect(_player).toBe(ctx.player);
    expect(_sound).toBe(ctx.sound);
    expect(_key).toBe(ctx.key);
    expect(_mouse).toBe(ctx.mouse);
    expect(_system).toBe(ctx.system);
    expect(_global).toBe(ctx.global);
    expect(_score).toBe(ctx.score);
  });
});