import { describe, it, expect, afterEach } from "vitest";
import {
  _getMovie,
  _getPlayer,
  _getSound,
  _getKey,
  _getMouse,
  _getSystem,
  _getGlobal,
} from "../singletons.js";
import { setActiveDirectorContext, getActiveDirectorContext } from "../accessor.js";
import { DirectorContext } from "../context.js";

describe("singletons facade (006 C8)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("all getters exist and return objects without an active context", () => {
    expect(_getMovie()).toBeDefined();
    expect(_getPlayer()).toBeDefined();
    expect(_getSound()).toBeDefined();
    expect(_getKey()).toBeDefined();
    expect(_getMouse()).toBeDefined();
    expect(_getSystem()).toBeDefined();
    expect(_getGlobal()).toBeDefined();
  });

  it("with an active context, getters return the context's core-object consts", () => {
    const ctx = new DirectorContext({ name: "act" });
    setActiveDirectorContext(ctx);
    expect(_getMovie()).toBe(ctx.movie);
    expect(_getPlayer()).toBe(ctx.player);
    expect(_getSound()).toBe(ctx.sound);
    expect(_getKey()).toBe(ctx.key);
    expect(_getMouse()).toBe(ctx.mouse);
    expect(_getSystem()).toBe(ctx.system);
    expect(_getGlobal()).toBe(ctx.global);
  });

  it("activate() makes the facade resolve the context instances", () => {
    const ctx = new DirectorContext({ name: "b" });
    ctx.activate();
    expect(getActiveDirectorContext()).toBe(ctx);
    expect(_getMovie()).toBe(ctx.movie);
    ctx.destroy();
  });

  it("clearing the active context returns fresh defaults", () => {
    const ctx = new DirectorContext({ name: "c" });
    ctx.activate();
    ctx.destroy();
    expect(getActiveDirectorContext()).toBeNull();
    expect(_getMovie()).not.toBe(ctx.movie);
  });
});