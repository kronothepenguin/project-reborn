import { describe, it, expect } from "vitest";
import { handleInputMessage } from "../input.js";
import { DirectorContext } from "../../engine/subsystem/context.js";

describe("input handler — key/mouse/focus forwarding (008 R6/US3)", () => {
  it("keydown/keyup feed _key fields", () => {
    const ctx = new DirectorContext({ width: 720, height: 480 });
    ctx.activate();
    handleInputMessage(ctx, { kind: "keydown", key: "q", keyCode: 81 });
    expect(ctx.key.key).toBe("q");
    expect(ctx.key.keyCode).toBe(81);
    handleInputMessage(ctx, { kind: "keyup", key: "q", keyCode: 81 });
    expect(ctx.key.key).toBe("");
  });

  it("mousemove translates client coords to stage space (scaled, y-flipped)", () => {
    const ctx = new DirectorContext({ width: 720, height: 480 });
    ctx.activate();
    // clientX/clientY relative to the canvas: (360, 240) → stage center
    handleInputMessage(ctx, { kind: "mousemove", clientX: 360, clientY: 240 });
    // Director stage origin bottom-left: y flipped (v = height - clientY)
    expect(ctx.mouse.mouseH).toBe(360);
    expect(ctx.mouse.mouseV).toBe(240); // 480 - 240
  });

  it("clamps out-of-stage coordinates", () => {
    const ctx = new DirectorContext({ width: 720, height: 480 });
    ctx.activate();
    handleInputMessage(ctx, { kind: "mousemove", clientX: 5000, clientY: 1000 });
    expect(ctx.mouse.mouseH).toBe(720);
    expect(ctx.mouse.mouseV).toBe(0); // 480 - 480 (clamped clientY)
  });

  it("mousedown/mouseup flip mouseDown and set clickLoc", () => {
    const ctx = new DirectorContext({ width: 720, height: 480 });
    ctx.activate();
    handleInputMessage(ctx, { kind: "mousedown", clientX: 100, clientY: 200 });
    expect(ctx.mouse.mouseDown).toBe(true);
    expect(ctx.mouse.clickLoc).toEqual({ h: 100, v: 280 }); // 480 - 200
    handleInputMessage(ctx, { kind: "mouseup", clientX: 100, clientY: 200 });
    expect(ctx.mouse.mouseDown).toBe(false);
  });

  it("blur releases held keys", () => {
    const ctx = new DirectorContext({ width: 720, height: 480 });
    ctx.activate();
    handleInputMessage(ctx, { kind: "keydown", key: "a", keyCode: 65 });
    expect(ctx.key.key).toBe("a");
    handleInputMessage(ctx, { kind: "blur" });
    expect(ctx.key.key).toBe("");
  });
});