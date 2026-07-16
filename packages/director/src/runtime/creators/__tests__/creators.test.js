import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { cast } from "../cast.js";
import { movie } from "../movie.js";
import { defineCast } from "../define-cast.js";
import { defineMovie } from "../define-movie.js";
import { CastLibraryObject } from "../../objects/cast-library.js";
import { MemberObject } from "../../objects/member.js";
import { _movie, _resetSingletons } from "../../singletons.js";

describe("creators", () => {
  beforeEach(() => {
    CastLibraryObject._reset();
    _resetSingletons();
  });
  afterEach(() => {
    CastLibraryObject._reset();
    _resetSingletons();
  });

  describe("cast(name)", () => {
    it("chains member adds and returns a registered CastLibraryObject on build()", () => {
      const lib = cast("Internal")
        .bitmap("Title", { width: 100, height: 50 })
        .field("Score", { text: "0" })
        .sound("Boom", { duration: 1.2, volume: 80 })
        .script("Action", { scriptText: "on enterFrame\nend" })
        .build();
      expect(lib).toBeInstanceOf(CastLibraryObject);
      expect(lib.name).toBe("Internal");
      expect(lib.member[1]).toBeInstanceOf(MemberObject);
      expect(lib.member["Title"].name).toBe("Title");
      expect(lib.member["Score"].text).toBe("0");
      expect(lib.member["Boom"].duration).toBe(1.2);
      expect(lib.member["Action"].scriptText).toBe("on enterFrame\nend");
    });

    it("assigns sequential cast-lib numbers when not specified", () => {
      const a = cast("A").build();
      const b = cast("B").build();
      expect(a.number).toBe(1);
      expect(b.number).toBe(2);
    });

    it("honors an explicit .number()", () => {
      const lib = cast("X").number(7).build();
      expect(lib.number).toBe(7);
    });
  });

  describe("defineCast(name, specs)", () => {
    it("builds a cast from an inline array of member specs", () => {
      const lib = defineCast("Cast", [
        { type: "bitmap", name: "B1", width: 8, height: 8 },
        { type: "text", name: "T1", text: "hi" },
        { type: "script", name: "S1", scriptText: "on foo\nend" },
      ]);
      expect(Object.keys(lib.member)).toHaveLength(3);
      expect(lib.member["B1"].name).toBe("B1");
      expect(lib.member["T1"].text).toBe("hi");
    });

    it("throws on an unknown member type", () => {
      expect(() => defineCast("Bad", [{ type: "mauve", name: "x" }])).toThrow(/mauve/);
    });
  });

  describe("movie(name)", () => {
    it("chains casts/options and returns a description on build()", () => {
      const lib = cast("Alpha").bitmap("a").build();
      const desc = movie("TestMovie")
        .cast(lib)
        .tempo(15)
        .width(800)
        .height(600)
        .src("test.js")
        .build();
      expect(desc.name).toBe("TestMovie");
      expect(desc.tempo).toBe(15);
      expect(desc.width).toBe(800);
      expect(desc.height).toBe(600);
      expect(desc.src).toBe("test.js");
      expect(desc.casts).toHaveLength(1);
      expect(desc.casts[0]).toBe(lib);
    });
  });

  describe("defineMovie(name, options)", () => {
    it("constructs and activates a DirectorContext", () => {
      CastLibraryObject._reset();
      const lib = cast("Setup").bitmap("bg").build();
      const ctx = defineMovie("My Movie", { tempo: 12, width: 320, height: 240, casts: lib });
      expect(ctx.name).toBe("My Movie");
      expect(ctx.tempo).toBe(12);
      expect(ctx.width).toBe(320);
      expect(ctx.height).toBe(240);
      // Activation rewired singleton slots to this context's instances.
      expect(_movie).toBe(ctx.movie);
      expect(CastLibraryObject.castLib[1]).toBe(lib);
      ctx.destroy();
    });

    it("accepts a pre-built movie description", () => {
      const desc = movie("FromDesc").tempo(5).build();
      const ctx = defineMovie("FromDesc", desc);
      expect(ctx.name).toBe("FromDesc");
      expect(ctx.tempo).toBe(5);
      ctx.destroy();
    });
  });
});