import { describe, it, expect, vi } from "vitest";
import { DirectorContext } from "../context.js";
import { MemberRegistry } from "../subsystems/member-registry.js";
import { NetState } from "../subsystems/net-state.js";
import { WindowRegistry } from "../subsystems/window-registry.js";

// Integration test for the DirectorContext + the three subsystem singletons
// (T022 / FR-004/FR-033/FR-036). Cross-subsystem lookup + lifecycle dispatch.

describe("DirectorContext × subsystems integration (T022)", () => {
  it("owns one instance of each subsystem per context", () => {
    const ctx = new DirectorContext();
    expect(ctx.memberRegistry).toBeInstanceOf(MemberRegistry);
    expect(ctx.netState).toBeInstanceOf(NetState);
    expect(ctx.windowRegistry).toBeInstanceOf(WindowRegistry);
  });

  it("two contexts own fully independent subsystem instances (FR-003 isolation)", () => {
    const ctxA = new DirectorContext();
    const ctxB = new DirectorContext();
    expect(ctxA.memberRegistry).not.toBe(ctxB.memberRegistry);
    expect(ctxA.netState).not.toBe(ctxB.netState);
    expect(ctxA.windowRegistry).not.toBe(ctxB.windowRegistry);

    // State registered against ctxA's registry does not leak to ctxB.
    const lib = { name: "Internal" };
    ctxA.memberRegistry.register(lib, { name: "Intro", number: 1 });
    expect(ctxB.memberRegistry.lookupByNameInCastLib(lib, "Intro")).toBeNull();
  });

  it("lifecycle events fire on the same context that owns the subsystems", () => {
    const ctx = new DirectorContext();
    const seq = [];
    ctx.addEventListener("prepareMovie", () => seq.push("prepareMovie"));
    ctx.addEventListener("startMovie", () => seq.push("startMovie"));

    ctx.prepareMovie();
    ctx.startMovie();

    expect(seq).toEqual(["prepareMovie", "startMovie"]);
  });

  it("destroy stops a context-owned event-loop handle and surfaces teardown to subsystem callers", () => {
    const ctx = new DirectorContext();
    const stop = vi.fn();
    ctx.eventLoopHandle = { stop };
    ctx.destroy();
    expect(stop).toHaveBeenCalledTimes(1);
    // The subsystem instances are still queryable after destroy (state
    // retained for post-mortem reads), but the loop handle is nulled.
    expect(ctx.memberRegistry).toBeInstanceOf(MemberRegistry);
    expect(ctx.eventLoopHandle).toBeNull();
  });

  it("netState.gotoNetMoviePendingUrl survives until taken (FR-033 main-thread relay)", () => {
    const ctx = new DirectorContext();
    ctx.netState.setGotoNetMoviePending("https://example.com/movie");
    expect(ctx.netState.takeGotoNetMoviePending()).toBe("https://example.com/movie");
  });

  it("WindowRegistry.frontWindow is null initially (FR-036 — MIAW deferred)", () => {
    const ctx = new DirectorContext();
    expect(ctx.windowRegistry.frontWindow()).toBeNull();
  });
});