import { describe, it, expect, afterEach } from "vitest";
import { the, char } from "../../../api/index.js";

afterEach(() => {
  the.itemDelimiter = ",";
  if (typeof the._reset === "function") the._reset();
});

describe("the proxy — defaults (no context)", () => {
  it("read/write system props expose documented defaults", () => {
    expect(the.itemDelimiter).toBe(",");
    expect(the.floatPrecision).toBe(4);
    expect(the.randomSeed).toBe(0);
  });

  it("mouse RO props expose typed defaults", () => {
    expect(typeof the.mouseH).toBe("number");
    expect(typeof the.mouseV).toBe("number");
    expect(the.mouseDown).toBe(false);
    expect(the.mouseUp).toBe(false);
    expect(the.clickOn).toBe(0);
  });

  it("key RO props expose typed defaults", () => {
    expect(the.key).toBe("");
    expect(the.keyCode).toBe(0);
    expect(the.shiftDown).toBe(false);
    expect(the.controlDown).toBe(false);
  });

  it("movie/player RW props expose the core-owned defaults", () => {
    expect(the.exitLock).toBe(false);
    expect(the.beepOn).toBe(false);
    expect(the.centerStage).toBe(true);
    expect(the.keyboardFocusSprite).toBe(-1);
    expect(the.editShortCutsEnabled).toBe(true);
    expect(the.debugPlaybackEnabled).toBe(false);
  });

  it("sound RW props expose the core-owned defaults", () => {
    expect(the.soundEnabled).toBe(true);
    expect(the.soundLevel).toBe(7);
  });

  it("computed props return numbers/strings (C9)", () => {
    expect(typeof the.milliseconds).toBe("number");
    expect(typeof the.milliSeconds).toBe("number");
    expect(typeof the.time).toBe("string");
    expect(typeof the.date).toBe("string");
    expect(typeof the.timer).toBe("number");
    expect(typeof the.ticks).toBe("number");
  });

  it("constant props expose documented values", () => {
    expect(the.pi).toBe(Math.PI);
    expect(the.maxInteger).toBe(2147483647);
    expect(the.maxinteger).toBe(2147483647);
    expect(the.true).toBe(true);
    expect(the.false).toBe(false);
    expect(the.void).toBe(null);
    expect(the.empty).toBe("");
    expect(the.tab).toBe("\t");
    expect(the.space).toBe(" ");
    expect(the.return).toBe("\r");
    expect(the.quote).toBe('"');
  });

  it("Score/stage-backed props return stable no-op defaults (until 004)", () => {
    const noop = [
      "frame",
      "frameLabel",
      "framePalette",
      "frameTempo",
      "marker",
      "label",
      "markerList",
      "labelList",
      "lastChannel",
      "timeoutLapsed",
      "currentTime",
      "numberOfCastLibs",
      "numberOfMembers",
    ];
    for (const name of noop) {
      expect(the[name], name).not.toBeUndefined();
    }
    expect(typeof the.numberOfCastMembersOfCastLib(1)).toBe("number");
  });
});

describe("the proxy — read-only enforcement (C5)", () => {
  it.each(["frame", "mouseH", "key", "maxInteger", "milliseconds", "the"])(
    "writing %s throws a script error",
    (name) => {
      expect(() => {
        the[name] = 1;
      }).toThrow();
    }
  );
});

describe("the proxy — read/write props (C5)", () => {
  it("stores and reads back writable props", () => {
    the.itemDelimiter = ":";
    expect(the.itemDelimiter).toBe(":");
    the.exitLock = true;
    expect(the.exitLock).toBe(true);
    the.beepOn = true;
    expect(the.beepOn).toBe(true);
    the.centerStage = false;
    expect(the.centerStage).toBe(false);
    the.keyboardFocusSprite = 3;
    expect(the.keyboardFocusSprite).toBe(3);
    the.soundLevel = 5;
    expect(the.soundLevel).toBe(5);
    the.randomSeed = 42;
    expect(the.randomSeed).toBe(42);
    the.selStart = 1;
    the.selEnd = 2;
    expect(the.selStart).toBe(1);
    expect(the.selEnd).toBe(2);
  });
});

describe("the proxy — unknown props throw (C6)", () => {
  it("reading an unknown property throws", () => {
    expect(() => void the.qwerty).toThrow();
  });

  it("writing an unknown property throws", () => {
    expect(() => {
      the.qwerty = 1;
    }).toThrow();
  });

  it("removed delimiters read throws (C8)", () => {
    expect(() => void the.wordDelimiter).toThrow();
    expect(() => void the.lineDelimiter).toThrow();
  });

  it("has returns false for unknown names", () => {
    expect("qwerty" in the).toBe(false);
    expect("wordDelimiter" in the).toBe(false);
  });
});

describe("the proxy — aliases (C7)", () => {
  it("aliases resolve to the canonical value", () => {
    expect(the.milliSeconds).toBe(the.milliseconds);
    expect(the.maxinteger).toBe(the.maxInteger);
  });
});

describe("the proxy — function forms (C4)", () => {
  it("counts chunks in a string", () => {
    expect(the.numberOfCharsIn("abc")).toBe(3);
    expect(the.numberOfItemsIn("a,b,c")).toBe(3);
    expect(the.numberOfLinesIn("a\rb")).toBe(2);
    expect(the.numberOfWordsIn("a b c")).toBe(3);
  });

  it("item counts follow the live delimiter (C3)", () => {
    the.itemDelimiter = ":";
    expect(the.numberOfItemsIn("a:b:c")).toBe(3);
  });

  it("returns last chunks", () => {
    expect(the.lastCharIn("abc")).toBe("c");
    expect(the.lastWordIn("a b c")).toBe("c");
    expect(the.lastItemIn("a,b,c")).toBe("c");
    expect(the.lastLineIn("a\rb")).toBe("b");
  });

  it("handles empty strings", () => {
    expect(the.numberOfCharsIn("")).toBe(0);
    expect(the.numberOfItemsIn("")).toBe(1);
    expect(the.numberOfWordsIn("")).toBe(1);
    expect(the.lastCharIn("")).toBe("");
  });

  it("composes count inside a range (chained count usage)", () => {
    expect(String(char(1).to(the.numberOfCharsIn("xy")).of("xy"))).toBe("xy");
  });
});