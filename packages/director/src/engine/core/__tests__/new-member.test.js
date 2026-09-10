import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { setActiveDirectorContext } from "../../subsystem/accessor.js";
import { ingestDefinition } from "../../../player/ingest.js";

const definition = {
  name: "nm",
  totalCastSlots: 2,
  casts: [
    { kind: "cast", name: "Internal", members: [
      { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "", width: 4, height: 4 } },
    ] },
    { kind: "cast", name: "Empty", members: [] },
  ],
  options: { tempo: 30, width: 640, height: 480, src: "" },
};

function makeCtx() {
  const ctx = new DirectorContext({});
  ingestDefinition(ctx, definition);
  return ctx;
}

describe("MovieObject.newMember (010 T006–T008)", () => {
  let ctx;
  beforeEach(() => { ctx = makeCtx(); });
  afterEach(() => setActiveDirectorContext(null));

  it("newMember(#button) returns a ButtonMember with the #button type symbol", () => {
    const m = ctx.movie.newMember(Symbol.for("button"));
    expect(m).toBeTruthy();
    expect(m.type).toBe(Symbol.for("button"));
  });

  it("newMember('button') (string form) maps to ButtonMember", () => {
    const m = ctx.movie.newMember("button");
    expect(m.constructor.name).toBe("ButtonMember");
  });

  it("registers the new member in the first empty cast library slot", () => {
    const m = ctx.movie.newMember("sound");
    // Internal (castLib 1) has number 1 taken; first empty slot is 2 in it.
    expect(m.number).toBe(2);
    expect(ctx.memberRegistry.lookupByNumber(ctx.castLibs[0], 2)).toBe(m);
  });

  it("uses the first cast with a free slot; falls through castLibs", () => {
    const s = ctx.movie.newMember("button");
    expect(s.number).toBe(2);
    const f = ctx.movie.newMember("font");
    expect(f.number).toBe(3);
  });

  it("without an active context, returns the member unregistered", () => {
    setActiveDirectorContext(null);
    const m = ctx.movie.newMember("cursor");
    expect(m).toBeTruthy();
    expect(m.constructor.name).toBe("CursorMember");
    expect(m.number).toBe(0);
  });

  it("unknown media type maps to a generic MemberObject", () => {
    const m = ctx.movie.newMember(Symbol.for("havok"));
    expect(m.constructor.name).toBe("MemberObject");
    expect(m.type).toBe(Symbol.for("havok"));
  });
});