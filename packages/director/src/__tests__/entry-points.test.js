import { describe, it, expect } from "vitest";
import * as root from "../index.js";
import * as lingo from "../api/index.js";
import * as browser from "../browser/index.js";

describe("public entry points (FR-007/FR-008)", () => {
  it("all three entries import without errors and share the expected symbols", () => {
    // root re-exports the lingo surface plus the browser surface
    expect(lingo).toBeTruthy();
    expect(browser).toBeTruthy();
    expect(root).toBeTruthy();
  });

  it("exports the 5 data-type classes", () => {
    for (const name of ["Color", "List", "PropList", "Point", "Rect"]) {
      expect(typeof lingo[name]).toBe("function");
    }
  });

  it("exports the 5 data-type creators (amendment 2026-08-31)", () => {
    for (const name of ["color", "list", "point", "propList", "rect"]) {
      expect(typeof lingo[name]).toBe("function");
    }
  });

  it("creators return proxied instances with bracket access", () => {
    const p = lingo.point(1, 2);
    expect(p[1]).toBe(1);
    const r = lingo.rect(1, 2, 3, 4);
    expect(r[3] - r[1]).toBe(2);
  });

  it("color() RGB form truncates; rgb() is NOT exported", () => {
    const c = lingo.color(300, -1, 12.9);
    expect(c.red).toBe(255);
    expect(c.green).toBe(0);
    expect(c.blue).toBe(12);
    expect("rgb" in lingo).toBe(false);
  });

  it("exports the 11 constants", () => {
    for (const name of [
      "EMPTY",
      "VOID",
      "RETURN",
      "SPACE",
      "TAB",
      "BACKSPACE",
      "ENTER",
      "QUOTE",
      "TRUE",
      "FALSE",
      "PI",
    ]) {
      expect(name in lingo).toBe(true);
    }
  });

  it("exports the 7 singletons", () => {
    for (const name of ["_movie", "_player", "_sound", "_key", "_mouse", "_system", "_global"]) {
      expect(name in lingo).toBe(true);
    }
  });

  it("exports the 12 syntax stand-ins", () => {
    for (const name of [
      "char",
      "charRange",
      "item",
      "itemRange",
      "line",
      "lineRange",
      "word",
      "wordRange",
      "the",
      "putInto",
      "putBefore",
      "putAfter",
    ]) {
      expect(name in lingo).toBe(true);
    }
  });

  it("spot-checks top-level method exports", () => {
    for (const name of ["go", "beep", "halt"]) {
      expect(typeof lingo[name]).toBe("function");
    }
  });

  it("does NOT export defineMovie/defineCast from the browser entry", () => {
    expect("defineMovie" in browser).toBe(false);
    expect("defineCast" in browser).toBe(false);
  });

  it("browser entry exposes the host surface", () => {
    for (const name of [
      "createContext",
      "destroyContext",
      "resetSingletons",
      "registerCustomElements",
      "_createMovie",
      "movie",
      "cast",
    ]) {
      expect(name in browser).toBe(true);
    }
  });
});
