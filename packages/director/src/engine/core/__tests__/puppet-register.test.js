import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { ingestDefinition } from "../../../player/ingest.js";
import { setActiveDirectorContext } from "../../subsystem/accessor.js";

const definition = {
  name: "puppet",
  totalCastSlots: 1,
  casts: [{ kind: "cast", name: "Internal", members: [
    { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "", width: 32, height: 32 } },
  ] }],
  options: { tempo: 30, width: 640, height: 480, src: "" },
  score: { frames: [
    { frame: 1, channels: { 1: { member: "Logo", loc: [10, 20], size: [32, 32] } } },
  ] },
};

function makeCtx() {
  const ctx = new DirectorContext({});
  ingestDefinition(ctx, definition);
  ctx.score.go(1);
  return ctx;
}

describe("puppet register (003 T006–T010)", () => {
  let ctx;
  beforeEach(() => {
    ctx = makeCtx();
  });
  afterEach(() => setActiveDirectorContext(null));

  it("puppetSprite(n, TRUE) registers a scripted sprite that preempts the Score cell", () => {
    const before = ctx.sprite(1);
    expect(before.locH).toBe(10); // Score cell

    ctx.puppetSprite(1, true);
    const scripted = ctx.sprite(1);
    expect(ctx.puppetSprites.has(1)).toBe(true);
    expect(ctx.isScripted(1)).toBe(true);
    expect(scripted.locH).toBe(10); // hydrated from the cell at register time
    expect(scripted.puppet).toBe(true);

    // live object — mutations persist after next resolution
    scripted.locH = 500;
    expect(ctx.sprite(1).locH).toBe(500);
    expect(ctx.sprite(1)).toBe(scripted);
  });

  it("puppetSprite(n, FALSE) removes the register and restores Score control", () => {
    ctx.puppetSprite(1, true);
    ctx.sprite(1).locH = 500;
    ctx.puppetSprite(1, false);
    expect(ctx.puppetSprites.has(1)).toBe(false);
    expect(ctx.isScripted(1)).toBe(false);
    expect(ctx.sprite(1).locH).toBe(10); // back to the Score cell
  });

  it("puppetSprite on an unpopulated channel creates an empty scripted sprite", () => {
    ctx.puppetSprite(5, true);
    expect(ctx.isScripted(5)).toBe(true);
    const s = ctx.sprite(5);
    expect(s).toBeTruthy();
    expect(s.spriteNum).toBe(5);
  });

  it("SpriteChannelObject.makeScriptedSprite centers by default, registers the sprite", () => {
    const ch = ctx.spriteChannel(1);
    const sprite = ch.makeScriptedSprite();
    expect(ch.scripted).toBe(true);
    expect(ctx.isScripted(1)).toBe(true);
    expect(ctx.sprite(1)).toBe(sprite);
  });

  it("SpriteChannelObject.removeScriptedSprite unregisters", () => {
    const ch = ctx.spriteChannel(1);
    ch.makeScriptedSprite();
    ch.removeScriptedSprite();
    expect(ch.scripted).toBe(false);
    expect(ctx.isScripted(1)).toBe(false);
  });

  it("MovieObject.puppetSprite delegates to the context register", () => {
    ctx.movie.puppetSprite(2, true);
    expect(ctx.isScripted(2)).toBe(true);
    ctx.movie.puppetSprite(2, false);
    expect(ctx.isScripted(2)).toBe(false);
  });

  it("stage channel (0) is never scripted", () => {
    expect(() => ctx.puppetSprite(0, true)).not.toThrow();
    expect(ctx.isScripted(0)).toBe(false);
  });
});