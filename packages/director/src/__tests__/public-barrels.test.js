import { describe, it, expect } from "vitest";

// Import the whole public surface and assert a representative set of names
// are actually exported. Catches typos / accidental renames in the barrels.
import * as lingo from "../lingo/index.js";
import * as browser from "../browser/index.js";
import * as root from "../index.js";

describe("lingo barrel (public surface)", () => {
  it("exports singleton slots", () => {
    for (const name of ["_movie", "_player", "_sound", "_key", "_mouse", "_system", "_global"]) {
      expect(lingo[name]).toBeDefined();
    }
  });

  it("exports constants (Chapter 9)", () => {
    for (const name of ["TRUE", "FALSE", "VOID", "EMPTY", "RETURN", "TAB", "QUOTE", "BACKSPACE", "ENTER", "SPACE", "PI"]) {
      expect(lingo[name]).toBeDefined();
    }
  });

  it("exports syntax stand-ins", () => {
    expect(typeof lingo.the).toBe("object");
    expect(lingo.the).not.toBeNull();
    for (const name of ["char", "charRange", "word", "wordRange", "item", "itemRange", "line", "lineRange", "putInto", "putBefore", "putAfter"]) {
      expect(typeof lingo[name]).toBe("function");
    }
  });

  it("exports top-level Lingo methods (Chapter 12) — representative sample", () => {
    for (const name of ["abort", "abs", "alert", "beep", "go", "halt", "quit", "marker", "sound", "sprite", "member", "castLib", "ilk", "delay", "cursor"]) {
      expect(typeof lingo[name]).toBe("function");
    }
  });

  it("does NOT re-export internal singleton setters", () => {
    expect(lingo._installSingletons).toBeUndefined();
    expect(lingo._resetSingletons).toBeUndefined();
  });
});

describe("browser barrel (public surface)", () => {
  it("exports createContext / destroyContext / resetSingletons", () => {
    expect(typeof browser.createContext).toBe("function");
    expect(typeof browser.destroyContext).toBe("function");
    expect(typeof browser.resetSingletons).toBe("function");
  });

  it("exports registerCustomElements + _createMovie", () => {
    expect(typeof browser.registerCustomElements).toBe("function");
    expect(typeof browser._createMovie).toBe("function");
  });
});

describe("root barrel", () => {
  it("re-exports both lingo and browser surfaces", () => {
    expect(root._movie).toBeDefined();
    expect(root.beep).toBeDefined();
    expect(root.createContext).toBeDefined();
    expect(root.registerCustomElements).toBeDefined();
  });
});

describe("createContext()", () => {
  it("instantiates a DirectorContext and activates it", async () => {
    const { createContext } = await import("../browser/index.js");
    const ctx = createContext({ name: "via-barrel" });
    expect(ctx.name).toBe("via-barrel");
    // After activate(), the lingo barrel's `_movie` should point at ctx.movie.
    expect(lingo._movie).toBe(ctx.movie);
    expect(lingo._player).toBe(ctx.player);
    expect(lingo._sound).toBe(ctx.sound);
  });
});