import { describe, it, expect } from "vitest";
import { cast } from "../cast.js";
import { movie } from "../movie.js";

describe("cast(name)", () => {
  it("chains member adds and returns a frozen CastDefinition on build()", () => {
    const def = cast("Internal")
      .bitmap("Title", { width: 100, height: 50 })
      .field("Score", { text: "0" })
      .sound("Boom", { audioBytes: new Uint8Array([1, 2, 3]) })
      .movieScript("Action", { content: "function enterFrame() {}" })
      .build();
    expect(def.kind).toBe("cast");
    expect(def.name).toBe("Internal");
    expect(def.members).toHaveLength(4);
    expect(Object.isFrozen(def)).toBe(true);
    expect(Object.isFrozen(def.members)).toBe(true);
  });

  it("assigns sequential member numbers starting at 1", () => {
    const def = cast("C")
      .field("A", { text: "a" })
      .field("B", { text: "b" })
      .field("C", { text: "c" })
      .build();
    expect(def.members[0].number).toBe(1);
    expect(def.members[1].number).toBe(2);
    expect(def.members[2].number).toBe(3);
  });

  it("constructs member definitions with correct mediaType", () => {
    const def = cast("C")
      .bitmap("b", { pixels: new Uint8Array([0]) })
      .button("btn", { text: "OK" })
      .colorPalette("pal", { colors: [0, 0, 0] })
      .cursor("cur", { glyph: new Uint8Array([0]) })
      .field("fld", { text: "hi" })
      .font("fnt", { glyphs: new Uint8Array([0]) })
      .sound("snd", { audioBytes: new Uint8Array([0]) })
      .text("txt", { text: "hello" })
      .build();
    expect(def.members.map((m) => m.mediaType)).toEqual([
      "bitmap", "button", "colorPalette", "cursor",
      "field", "font", "sound", "text",
    ]);
  });

  it("generic .member() covers any mediaType", () => {
    const def = cast("C")
      .member("dvd", { type: "dvd", payload: {} })
      .build();
    expect(def.members[0].mediaType).toBe("dvd");
  });

  it("member definitions are plain data, not MemberObject instances", () => {
    const def = cast("C").field("F", { text: "x" }).build();
    expect(def.members[0].kind).toBe("member");
    expect(typeof def.members[0]).toBe("object");
    expect(def.members[0].constructor).toBe(Object);
  });
});

describe("movie(name)", () => {
  it("chains casts/options and returns a frozen MovieDefinition on build()", () => {
    const c = cast("Alpha").bitmap("a").build();
    const desc = movie("TestMovie")
      .cast(c)
      .tempo(15)
      .width(800)
      .height(600)
      .src("test.js")
      .build();
    expect(desc.kind).toBe("movie");
    expect(desc.name).toBe("TestMovie");
    expect(desc.tempo).toBe(15);
    expect(desc.width).toBe(800);
    expect(desc.height).toBe(600);
    expect(desc.src).toBe("test.js");
    expect(desc.casts).toHaveLength(1);
    expect(desc.casts[0]).toBe(c);
    expect(Object.isFrozen(desc)).toBe(true);
  });
});