import { describe, it, expect, vi } from "vitest";
import { DirectorContext } from "../context.js";

describe("DirectorContext / Score-independent lifecycle dispatch (FR-037)", () => {
  it("extends EventTarget (research.md R2 / FR-028)", () => {
    const ctx = new DirectorContext();
    expect(ctx).toBeInstanceOf(EventTarget);
  });

  it("dispatches prepareMovie as a CustomEvent on the context", () => {
    const ctx = new DirectorContext();
    const spy = vi.fn();
    ctx.addEventListener("prepareMovie", spy);
    ctx.prepareMovie();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(CustomEvent);
    expect(spy.mock.calls[0][0].detail.movie).toBe(ctx.movie);
  });

  it("dispatches startMovie once on play start", () => {
    const ctx = new DirectorContext();
    const spy = vi.fn();
    ctx.addEventListener("startMovie", spy);
    ctx.startMovie();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy.mock.calls[0][0].detail.movie).toBe(ctx.movie);
  });

  it("dispatches stopMovie on destroy", () => {
    const ctx = new DirectorContext();
    const spy = vi.fn();
    ctx.addEventListener("stopMovie", spy);
    ctx.destroy();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("dispatches per-frame lifecycle events independently of Score data (FR-037)", () => {
    const ctx = new DirectorContext();
    const received = [];
    ctx.addEventListener("prepareFrame", (e) => received.push("prepareFrame"));
    ctx.addEventListener("enterFrame", (e) => received.push("enterFrame"));
    ctx.addEventListener("exitFrame", (e) => received.push("exitFrame"));

    ctx.prepareFrame();
    ctx.enterFrame();
    ctx.exitFrame();

    expect(received).toEqual(["prepareFrame", "enterFrame", "exitFrame"]);
  });

  it("fires idle and timeout hooks by name", () => {
    const ctx = new DirectorContext();
    const idle = vi.fn();
    const timeout = vi.fn();
    ctx.addEventListener("idle", idle);
    ctx.addEventListener("timeout", timeout);
    ctx.idle();
    ctx.timeout();
    expect(idle).toHaveBeenCalledTimes(1);
    expect(timeout).toHaveBeenCalledTimes(1);
  });

  it("documents the order: prepareMovie → startMovie → (prepareFrame → enterFrame → exitFrame)ⁿ → stopMovie", () => {
    const ctx = new DirectorContext();
    const seq = [];
    const names = ["prepareMovie", "startMovie", "prepareFrame", "enterFrame", "exitFrame", "stopMovie"];
    for (const name of names) ctx.addEventListener(name, () => seq.push(name));

    ctx.prepareMovie();
    ctx.startMovie();
    ctx.prepareFrame();
    ctx.enterFrame();
    ctx.exitFrame();
    ctx.destroy();
    expect(seq).toEqual(names);
  });

  it("each lifecycle event carries the movie singleton in its detail", () => {
    const ctx = new DirectorContext();
    for (const name of ["prepareMovie", "startMovie", "stopMovie", "prepareFrame", "enterFrame", "exitFrame"]) {
      const spy = vi.fn();
      ctx.addEventListener(name, spy);
      ctx[name]();
      expect(spy.mock.calls[0][0].detail.movie).toBe(ctx.movie);
    }
  });
});