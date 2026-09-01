import { describe, it, expect } from "vitest";
import { char, charRange, item, itemRange, line, lineRange, word, wordRange, the, putInto, putBefore, putAfter } from "../../../api/index.js";

const names = [char, charRange, item, itemRange, line, lineRange, word, wordRange, the, putInto, putBefore, putAfter];

describe("syntax public surface (US4)", () => {
  it("exports all 12 stand-ins from the lingo entry", () => {
    expect(names.every((n) => typeof n === "function" || typeof n === "object")).toBe(true);
  });

  it("does NOT self-register onto globalThis (player registers globals)", () => {
    expect("the" in globalThis).toBe(false);
    expect(globalThis.the).toBeUndefined();
  });

  it("helpers behave identically with default singletons", () => {
    expect(String(char(1).of("abc"))).toBe("a");
    expect(putAfter("ab", "c")).toBe("abc");
    expect(the.itemDelimiter).toBe(",");
  });

  it("YAGNI: undocumented the names are absent", () => {
    for (const name of ["numberOfSounds", "machineType", "wordDelimiter", "lineDelimiter"]) {
      expect(name in the).toBe(false);
      expect(() => void the[name]).toThrow();
    }
  });

  it("Object.keys(the) enumerates only known canonical keys", () => {
    const keys = Object.keys(the);
    expect(keys.length).toBeGreaterThan(40);
    expect(keys).toContain("itemDelimiter");
    expect(keys).toContain("maxInteger");
    expect(keys).not.toContain("maxinteger");
    expect(keys).not.toContain("wordDelimiter");
  });
});