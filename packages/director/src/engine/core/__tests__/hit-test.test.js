import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { ingestDefinition } from "../../../player/ingest.js";
import { setActiveDirectorContext } from "../../subsystem/accessor.js";
import { hitTest } from "../../../api/methods/hitTest.js";

const definition = {
  name: "hit",
  totalCastSlots: 1,
  casts: [{ kind: "cast", name: "Internal", members: [
    { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "", width: 32, height: 32 } },
  ] }],
  options: { tempo: 30, width: 640, height: 480, src: "" },
  score: { frames: [
    { frame: 1, channels: {
      1: { member: "Logo", loc: [0, 0], size: [100, 100], visible: true },
      2: { member: "Logo", loc: [50, 50], size: [100, 100], visible: true },
      3: { member: "Logo", loc: [400, 400], size: [10, 10], visible: true },
    } },
  ] },
};

function makeCtx() {
  const ctx = new DirectorContext({});
  ingestDefinition(ctx, definition);
  ctx.score.go(1);
  return ctx;
}

describe("hitTest + constraint (003 T011–T015)", () => {
  let ctx;
  beforeEach(() => {
    ctx = makeCtx();
  });
  afterEach(() => setActiveDirectorContext(null));

  it("hitTest(point) returns the topmost live sprite under the point", () => {
    const s1 = ctx.sprite(1);
    const hit = s1.hitTest({ h: 75, v: 75 });
    expect(hit).toBeTruthy();
    expect(hit).toBe(ctx.sprite(2)); // channel 2 is topmost over channel 1 at (75,75)
  });

  it("hitTest returns VOID (null) outside all sprite bounds", () => {
    const hit = ctx.sprite(1).hitTest({ h: 300, v: 300 });
    expect(hit).toBeNull();
  });

  it("hitTest respects the hierarchy registry of the active context (sprites only, populated visible)", () => {
    const hit = ctx.sprite(3).hitTest({ h: 405, v: 405 });
    expect(hit).toBe(ctx.sprite(3));
  });

  it("top-level hitTest(spriteRef, point) delegates to the live sprite", () => {
    expect(hitTest(ctx.sprite(1), { h: 5, v: 5 })).toBe(ctx.sprite(1));
  });

  it("puppeted sprites participate in hit testing", () => {
    ctx.puppetSprite(4, true);
    const p = ctx.sprite(4);
    p.locH = 0;
    p.locV = 0;
    p.width = 50;
    p.height = 50;
    const hit = p.hitTest({ h: 25, v: 25 });
    expect(hit).toBe(p);
  });

  it("constrainH clamps the constrained sprite loc into the constrainer bounds", () => {
    const mover = ctx.sprite(1);
    mover.locH = 500;
    ctx.movie.constrainH(1, 1);
    expect(mover.locH).toBe(100); // constrainer right edge
  });

  it("constrainV clamps the vertical axis", () => {
    const mover = ctx.sprite(1);
    mover.locV = -50;
    ctx.movie.constrainV(1, 1);
    expect(mover.locV).toBe(0); // constrainer top
  });

  it("constraint field on a sprite prevents out-of-bounds loc through the clamp helper", () => {
    const mover = ctx.sprite(3);
    const target = ctx.sprite(1);
    mover.constraint = target.spriteNum;
    mover.locH = 9999;
    mover.locV = 9999;
    constrainIfNeeded(ctx, mover);
    expect(mover.locH).toBe(100); // clamped into sprite 1's bounds
    expect(mover.locV).toBe(100);
  });
});

import { constrainIfNeeded } from "../../subsystem/sprite-hydrate.js";