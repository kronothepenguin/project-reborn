import { describe, it, expect, afterEach } from "vitest";
import { getActiveDirectorContext, setActiveDirectorContext } from "../accessor.js";
import { DirectorContext } from "../context.js";

describe("accessor — active DirectorContext (006 C8)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("returns null when no context is active", () => {
    expect(getActiveDirectorContext()).toBeNull();
  });

  it("setActiveDirectorContext(ctx) makes getActiveDirectorContext return it", () => {
    const ctx = new DirectorContext({ name: "a" });
    setActiveDirectorContext(ctx);
    expect(getActiveDirectorContext()).toBe(ctx);
  });

  it("activate() installs the context as active; destroy() clears it", () => {
    const ctx = new DirectorContext({ name: "b" });
    expect(getActiveDirectorContext()).toBeNull();
    ctx.activate();
    expect(getActiveDirectorContext()).toBe(ctx);
    ctx.destroy();
    expect(getActiveDirectorContext()).toBeNull();
  });

  it("last activate wins; re-activating another ctx replaces it", () => {
    const a = new DirectorContext({ name: "a" });
    const b = new DirectorContext({ name: "b" });
    a.activate();
    b.activate();
    expect(getActiveDirectorContext()).toBe(b);
    b.destroy();
    a.destroy();
  });

  it("no globalThis pollution from activation", () => {
    const ctx = new DirectorContext({ name: "c" });
    ctx.activate();
    expect(globalThis._movie).toBeUndefined();
    expect(globalThis._score).toBeUndefined();
    ctx.destroy();
  });
});