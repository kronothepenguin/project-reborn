import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../context.js";
import { ingestDefinition } from "../../../player/ingest.js";
import { setActiveDirectorContext } from "../accessor.js";
import { SpriteObject } from "../../core/sprite.js";

const definition = {
  name: "life",
  totalCastSlots: 1,
  casts: [{ kind: "cast", name: "Internal", members: [
    { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "", width: 32, height: 32 } },
  ] }],
  options: { tempo: 30, width: 640, height: 480, src: "" },
  score: { frames: [
    { frame: 1, channels: {
      1: { member: "Logo", loc: [10, 20], size: [32, 32] },
      2: { member: "Logo", loc: [0, 0], size: [10, 10] },
    } },
  ] },
};

function makeCtx() {
  const ctx = new DirectorContext({});
  ingestDefinition(ctx, definition);
  ctx.score.go(1);
  return ctx;
}

describe("frameStep live sprite dispatch (003 T016–T018)", () => {
  let ctx;
  beforeEach(() => {
    ctx = makeCtx();
  });
  afterEach(() => setActiveDirectorContext(null));

  it("beginSprite/endSprite carry a live SpriteObject (detail.sprite)", () => {
    const seen = [];
    ctx.addEventListener("beginSprite", (e) => seen.push(["begin", e.detail.channel, e.detail.sprite]));
    ctx.addEventListener("endSprite", (e) => seen.push(["end", e.detail.channel, e.detail.sprite]));

    ctx.frameStep();

    expect(seen.length).toBe(4); // begin/end × channels 1,2
    expect(seen[0][0]).toBe("begin");
    expect(seen[0][1]).toBe(1);
    expect(seen[0][2]).toBe(ctx.sprite(1));
    expect(seen[1][1]).toBe(1); // end of channel 1
    expect(seen[2][1]).toBe(2);
    for (const [, , sprite] of seen) {
      expect(sprite).toBeTruthy();
      expect(typeof sprite.spriteNum).toBe("number");
      expect(sprite instanceof SpriteObject).toBe(true);
    }
  });

  it("detail still carries channel + cell for 008 renderer compat", () => {
    const seen = [];
    ctx.addEventListener("beginSprite", (e) => seen.push(e.detail));
    ctx.frameStep();
    expect(seen[0].channel).toBe(1);
    expect(seen[0].cell).toBeTruthy();
    expect(seen[0].cell.member).toBe("Logo");
  });

  it("puppeted channels also dispatch live sprites", () => {
    ctx.puppetSprite(5, true);
    const seen = [];
    ctx.addEventListener("beginSprite", (e) => seen.push(e.detail.channel));
    ctx.frameStep();
    expect(seen).toContain(5);
  });
});