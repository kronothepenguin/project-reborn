import { describe, it, expect, afterEach } from "vitest";
import { installGlobals } from "../worker-shim.js";
import { DirectorContext } from "../../engine/subsystem/context.js";
import { setActiveDirectorContext } from "../../engine/subsystem/accessor.js";

describe("worker-shim installGlobals (008 C1)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("installs frozen getters for the singleton names + the + barrel methods", () => {
    const sandbox = {};
    installGlobals(sandbox);
    expect(Object.keys(sandbox)).toContain("_movie");
    expect(Object.keys(sandbox)).toContain("the");
    expect(Object.keys(sandbox)).toContain("_key");
    expect(Object.keys(sandbox)).toContain("go");
    for (const name of ["_movie", "_player", "_sound", "_key", "_mouse", "_system", "_global"]) {
      const desc = Object.getOwnPropertyDescriptor(sandbox, name);
      expect(desc).toBeTruthy();
      expect(desc.configurable).toBe(false);
      expect(desc.set).toBeUndefined(); // no setter -> writes silently fail
    }
  });

  it("reading _movie resolves the active context's movie object", () => {
    const sandbox = {};
    installGlobals(sandbox);
    expect(sandbox._movie).toBeDefined();
    const ctx = new DirectorContext({ name: "worker-test" });
    ctx.activate();
    expect(sandbox._movie).toBe(ctx.movie);
    ctx.destroy();
  });

  it("the is the live `the` proxy; barrel methods are callable", () => {
    const sandbox = {};
    installGlobals(sandbox);
    expect(typeof sandbox.the).toBe("object");
    expect(typeof sandbox.go).toBe("function");
    expect(typeof sandbox.beep).toBe("function");
    expect(typeof sandbox.abs).toBe("function");
  });

  it("assignment to a global getter silently fails (frozen)", () => {
    const sandbox = {};
    installGlobals(sandbox);
    expect(() => { "use strict"; sandbox._movie = 42; }).toThrow();
    expect(sandbox._movie).not.toBe(42);
  });
});