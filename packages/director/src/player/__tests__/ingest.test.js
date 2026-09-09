import { describe, it, expect } from "vitest";
import { DirectorContext } from "../../engine/subsystem/context.js";
import { ingestDefinition } from "../ingest.js";
import { getActiveDirectorContext, setActiveDirectorContext } from "../../engine/subsystem/accessor.js";

const HABBO_DEF = {
  name: "habbo",
  casts: [
    { kind: "cast", name: "Internal", members: [
      { kind: "member", name: "Initialization", mediaType: "script", payload: {}, registrationPoint: "(0,0)" },
      { kind: "member", name: "Init", mediaType: "script", payload: {}, registrationPoint: "(0,0)" },
      { kind: "member", name: "Loop", mediaType: "script", payload: {}, registrationPoint: "(0,0)" },
      { kind: "member", name: "Logo", mediaType: "bitmap", payload: { width: 32, height: 32 }, registrationPoint: "(29,23)" },
    ]},
    { kind: "cast", name: "fuse_client", members: [
      { kind: "member", name: "System Props", mediaType: "field", payload: { text: "x" } },
    ]},
  ],
  options: { tempo: 15, width: 720, height: 480 },
  score: { frames: [{ marker: "intro" }, { channels: {} }], tempo: 15 },
};

describe("ingestDefinition (008 R2 / C8)", () => {
  it("builds populated casts + member registry from the definition", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    expect(ctx.castLibs).toHaveLength(2);
    expect(ctx.castLibs[0].name).toBe("Internal");
    expect(ctx.castLibs[1].name).toBe("fuse_client");
    const logo = ctx.memberRegistry.lookupByNameInMovie(ctx.movie, "Logo");
    expect(logo).toBeDefined();
    expect(logo.name).toBe("Logo");
    expect(logo.mediaType).toBe("bitmap");
  });

  it("sets the score from the definition's score section", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    expect(ctx.score).toBeDefined();
    expect(ctx.score.tempo).toBe(15);
    expect(ctx.score.frames).toHaveLength(2);
    ctx.score.go("intro");
    expect(ctx.score.frame).toBe(1);
  });

  it("applies options (tempo/width/height)", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    expect(ctx.tempo).toBe(15);
    expect(ctx.width).toBe(720);
    expect(ctx.height).toBe(480);
  });

  it("activates the context", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    expect(getActiveDirectorContext()).toBe(ctx);
    setActiveDirectorContext(null);
  });
});