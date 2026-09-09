import { describe, it, expect } from "vitest";
import { DirectorContext } from "../../engine/subsystem/context.js";
import { ingestDefinition } from "../ingest.js";

// Faithful to apps/client/src/game/habbo/Casts.csv (73 slots: 1 Internal,
// 2 fuse_client, 3..73 empty) + Internal_Members.csv (4 members).
const HABBO_DEF = {
  name: "habbo",
  totalCastSlots: 73,
  casts: [
    { kind: "cast", name: "Internal", members: [
      { kind: "member", name: "Initialization", mediaType: "script", payload: {}, registrationPoint: "(0, 0)" },
      { kind: "member", name: "Init", mediaType: "script", payload: {}, registrationPoint: "(0, 0)" },
      { kind: "member", name: "Loop", mediaType: "script", payload: {}, registrationPoint: "(0, 0)" },
      { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "data:image/png;base64,AAAA", width: 32, height: 32 }, registrationPoint: "(29, 23)" },
    ]},
    { kind: "cast", name: "fuse_client", members: [
      { kind: "member", name: "System Props", mediaType: "field", payload: { text: "x" } },
    ]},
  ],
  options: { tempo: 15, width: 720, height: 480 },
};

describe("ingest habbo definition (008 US6)", () => {
  it("builds all 73 casts; slots 1-2 populated, 3..73 empty", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    expect(ctx.castLibs).toHaveLength(73);
    expect(ctx.castLibs[0].name).toBe("Internal");
    expect(ctx.castLibs[1].name).toBe("fuse_client");
    for (let i = 2; i < 73; i++) {
      expect(ctx.castLibs[i]).toBeDefined();
      expect(Object.keys(ctx.castLibs[i].member)).toHaveLength(0);
    }
  });

  it("member('Logo') resolves via the movie castLib", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    const lib = ctx.movie.castLib["Internal"];
    expect(lib.member["Logo"]).toBeDefined();
    expect(lib.member["Logo"].mediaType).toBe("bitmap");
  });

  it("castLib(2) = fuse_client by number lookup", () => {
    const ctx = new DirectorContext({});
    ingestDefinition(ctx, HABBO_DEF);
    expect(ctx.movie.castLib[2].name).toBe("fuse_client");
  });
});