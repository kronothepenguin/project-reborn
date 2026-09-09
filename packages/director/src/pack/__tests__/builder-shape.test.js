import { describe, it, expect } from "vitest";
import { movie } from "../movie.js";
import { cast } from "../cast.js";

describe("pack builders conform to the C8 definition contract (008 D)", () => {
  it("movie().cast().score().build() -> {name, casts, options{tempo,width,height,src}, score?}", () => {
    const def = movie("habbo")
      .cast(cast("Internal").movieScript("Initialization", {}).build())
      .tempo(15)
      .width(720)
      .height(480)
      .src("/habbo/index.js")
      .score({ frames: [{ marker: "intro" }], tempo: 15 })
      .build();
    expect(Object.isFrozen(def)).toBe(true);
    expect(def.name).toBe("habbo");
    expect(def.options).toEqual({ tempo: 15, width: 720, height: 480, src: "/habbo/index.js" });
    expect(def.score).toEqual({ frames: [{ marker: "intro" }], tempo: 15 });
    expect(def.casts[0].kind).toBe("cast");
    expect(def.casts[0].name).toBe("Internal");
    expect(def.casts[0].members[0].mediaType).toBe("script");
  });

  it("cast(name).script().bitmap().build() -> {kind:'cast', name, members[]}", () => {
    const c = cast("Internal")
      .bitmap("Logo", { width: 32, height: 32, data: "data:image/png;base64,AAAA" })
      .field("System Props", { text: "x" })
      .build();
    expect(c.kind).toBe("cast");
    expect(c.name).toBe("Internal");
    expect(c.members).toHaveLength(2);
    expect(c.members[0]).toMatchObject({
      kind: "member",
      name: "Logo",
      mediaType: "bitmap",
      payload: { width: 32, height: 32, data: "data:image/png;base64,AAAA" },
    });
  });

  it("member numbers are implicit in order (registration order preserved)", () => {
    const c = cast("fuse_client")
      .field("System Props", {})
      .field("System Texts", {})
      .member("Error API", { type: "script" })
      .build();
    expect(c.members.map((m) => m.name)).toEqual(["System Props", "System Texts", "Error API"]);
  });
});