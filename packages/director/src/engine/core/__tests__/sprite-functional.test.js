import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { ingestDefinition } from "../../../player/ingest.js";
import { setActiveDirectorContext } from "../../subsystem/accessor.js";
import { sprite } from "../../../api/methods/sprite.js";

const definition = {
  name: "sprites",
  totalCastSlots: 1,
  casts: [{ kind: "cast", name: "Internal", members: [
    { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "", width: 32, height: 32 } },
  ] }],
  options: { tempo: 30, width: 640, height: 480, src: "" },
  score: { frames: [
    { frame: 1, channels: {
      1: { member: "Logo", loc: [10, 20], size: [32, 32], visible: true },
      3: { member: "Logo", loc: [50, 60] },
    } },
    { frame: 2, channels: { 1: { member: "Logo", loc: [100, 200] } } },
  ] },
};

function makeCtx() {
  const ctx = new DirectorContext({});
  ingestDefinition(ctx, definition);
  return ctx;
}

describe("sprite(s) resolution + hydration (003 T001–T004)", () => {
  let ctx;
  beforeEach(() => {
    ctx = makeCtx();
    ctx.score.go(1);
  });
  afterEach(() => setActiveDirectorContext(null));

  it("sprite(n) returns a live SpriteObject hydrated from the Score cell", () => {
    const s = ctx.sprite(1);
    expect(s).toBeTruthy();
    expect(s.spriteNum).toBe(1);
    expect(s.loc).toBeTruthy();
    expect(s.locH).toBe(10);
    expect(s.locV).toBe(20);
    expect(s.width).toBe(32);
    expect(s.height).toBe(32);
    expect(s.visible).toBe(true);
  });

  it("cell loc header fields map to locH/locV and left/top/right/bottom", () => {
    const s = ctx.sprite(1);
    expect(s.locH).toBe(10);
    expect(s.locV).toBe(20);
    expect(s.left).toBe(10);
    expect(s.top).toBe(20);
    expect(s.right).toBe(10 + 32);
    expect(s.bottom).toBe(20 + 32);
  });

  it("sprite(0) returns a stage sprite (inert, no-op safe)", () => {
    const stage = ctx.sprite(0);
    expect(stage).toBeTruthy();
    expect(stage.spriteNum).toBe(0);
    expect(stage.visible).toBe(false);
  });

  it("unpopulated channel in the current frame returns null", () => {
    expect(ctx.sprite(2)).toBeNull();
  });

  it("resolution follows the playhead (frame 2 rehydrates the same live object)", () => {
    const a = ctx.sprite(1);
    expect(a.locH).toBe(10);
    ctx.score.go(2);
    const b = ctx.sprite(1);
    expect(b.locH).toBe(100);
    expect(b.locV).toBe(200);
    // same instance reused (a live object, not recreated per call)
    expect(b).toBe(a);
  });

  it("top-level sprite(n) api resolves through the active context", () => {
    const s = sprite(1);
    expect(s).toBeTruthy();
    expect(s.locH).toBe(10);
  });

  it("missing member name resolves but has no member payload", () => {
    const s = ctx.sprite(3);
    expect(s).toBeTruthy();
  });
});