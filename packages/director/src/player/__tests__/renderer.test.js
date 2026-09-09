import { describe, it, expect, vi } from "vitest";
import { createRenderer } from "../renderer.js";
import { DirectorContext } from "../../engine/subsystem/context.js";

// A fake 2d context that records draw calls (fallback path doesn't use one,
// but the OffscreenCanvas primary path and the shared draw logic do).
function fake2d() {
  const calls = [];
  return {
    calls,
    fillRect(x, y, w, h) { calls.push({ op: "fillRect", x, y, w, h }); },
    clearRect() {},
    drawImage(img, dx, dy, dw, dh) { calls.push({ op: "drawImage", img, dx, dy, dw, dh }); },
    fillStyle: "#000",
  };
}

function buildCtx({ frames }) {
  const ctx = new DirectorContext({ score: { frames }, width: 720, height: 480 });
  ctx.activate();
  ctx.score.advance();
  return ctx;
}

describe("renderer — flat-2D Score rendering (008 R4/US2)", () => {
  it("draws populated channels in ascending order (z-order) with loc/size", () => {
    const ctx = buildCtx({ frames: [{
      channels: {
        1: { member: "A", loc: [10, 10], size: [50, 50], visible: true },
        7: { member: "B", loc: [100, 100], size: [80, 80], visible: true },
      },
    }] });
    const images = { A: { width: 10, height: 10 }, B: { width: 10, height: 10 } };
    const renderer = createRenderer({ mode: "offscreen" });
    const fake = fake2d();
    renderer._drawContext = fake;
    renderer._resolveImage = (name) => images[name];

    renderer.renderFrame(ctx);
    const ops = fake.calls;
    expect(ops[0].op).toBe("fillRect"); // bg fill first
    expect(ops[1].op).toBe("drawImage");
    expect(ops[1].img).toBe(images.A);
    expect(ops[1].dx).toBe(10);
    expect(ops[1].dy).toBe(10);
    expect(ops[2].op).toBe("drawImage");
    expect(ops[2].img).toBe(images.B);
    expect(ops[2].dx).toBe(100);
  });

  it("skips invisible sprites and missing media", () => {
    const ctx = buildCtx({ frames: [{
      channels: {
        1: { member: "A", loc: [0, 0], size: [10, 10], visible: false },
        2: { member: "MISSING", loc: [0, 0], size: [10, 10], visible: true },
      },
    }] });
    const renderer = createRenderer({ mode: "offscreen" });
    const fake = fake2d();
    renderer._drawContext = fake;
    renderer._resolveImage = () => null;
    renderer.renderFrame(ctx);
    // only the bg fill; no sprite draws
    expect(fake.calls).toEqual([{ op: "fillRect", x: 0, y: 0, w: 720, h: 480 }]);
  });

  it("empty frame clears to bgColor with no draws", () => {
    const ctx = buildCtx({ frames: [{}] });
    const renderer = createRenderer({ mode: "offscreen" });
    const fake = fake2d();
    renderer._drawContext = fake;
    renderer.renderFrame(ctx);
    expect(fake.calls).toEqual([{ op: "fillRect", x: 0, y: 0, w: 720, h: 480 }]);
  });

  it("updateStage() renders the current frame synchronously", () => {
    const ctx = buildCtx({ frames: [{
      channels: { 1: { member: "A", loc: [5, 5], size: [20, 20], visible: true } },
    }] });
    const renderer = createRenderer({ mode: "offscreen" });
    const fake = fake2d();
    renderer._drawContext = fake;
    renderer._resolveImage = () => ({ width: 10, height: 10 });
    renderer.updateStage(ctx);
    expect(fake.calls.some((c) => c.op === "drawImage")).toBe(true);
  });
});

describe("renderer — paint fallback (008 C5)", () => {
  it("produces a paint message with imageData + seq, latest-wins", () => {
    const posted = [];
    const ctx = buildCtx({ frames: [{ channels: {} }] });
    const renderer = createRenderer({ mode: "paint", onPaint: (msg) => posted.push(msg), width: 64, height: 48 });
    renderer.renderFrame(ctx);
    renderer.renderFrame(ctx);
    expect(posted.length).toBe(2);
    expect(posted[0].kind).toBe("paint");
    expect(posted[0].width).toBe(64);
    expect(posted[0].height).toBe(48);
    expect(posted[0].seq).toBe(1);
    expect(posted[1].seq).toBe(2);
  });
});