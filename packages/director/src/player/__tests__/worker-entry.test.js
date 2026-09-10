import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createWorkerEntry } from "../worker-entry.js";

const tinyDefinition = {
  name: "tiny",
  totalCastSlots: 2,
  casts: [
    { kind: "cast", name: "Internal", members: [
      { kind: "member", name: "Logo", mediaType: "bitmap", payload: { data: "data:image/png;base64,AA==", width: 2, height: 2 } },
    ]},
    { kind: "cast", name: "Empty", members: [] },
  ],
  options: { tempo: 30, width: 320, height: 240, src: "" },
};

describe("worker-entry.js — real-worker bootstrap (009)", () => {
  let posts;
  let sandbox;
  let entry;

  beforeEach(() => {
    posts = [];
    sandbox = {};
    entry = createWorkerEntry({ post: (m) => posts.push(m), sandbox });
  });

  afterEach(() => {
    entry.destroy();
    vi.useRealTimers();
  });

  it("installGlobals on the sandbox + ready after inline-definition init", async () => {
    await entry.init({ definition: tinyDefinition, externalParams: [] });
    expect(posts.at(-1)).toEqual({ kind: "ready", detail: { name: "tiny" } });
    expect(sandbox._movie).toBe(entry.context.movie);
    expect(sandbox.the).toBeDefined();
    expect(typeof sandbox.go).toBe("function");
    expect(entry.context.castLibs).toHaveLength(2);
    expect(entry.context.castLibs[0].member["Logo"]).toBeTruthy();
  });

  it("posts error on invalid definition", async () => {
    await entry.init({ definition: null, externalParams: [] });
    expect(posts.some((m) => m.kind === "error")).toBe(true);
  });

  it("start runs the tempo loop with paint fallback and lifecycle dispatch", async () => {
    const lifecycle = [];
    entry.context?.addEventListener?.("prepareMovie", () => lifecycle.push("prepareMovie"));
    await entry.init({ definition: tinyDefinition, externalParams: [] });
    const ctx = entry.context;
    ctx.addEventListener("prepareMovie", () => lifecycle.push("prepareMovie"));
    ctx.addEventListener("startMovie", () => lifecycle.push("startMovie"));

    vi.useFakeTimers();
    entry.start();
    expect(lifecycle).toEqual(["prepareMovie", "startMovie"]);
    vi.advanceTimersByTime(1000 / 30 * 3);
    const paints = posts.filter((m) => m.kind === "paint");
    expect(paints.length).toBeGreaterThanOrEqual(2);
    expect(paints[0].width).toBe(320);
    expect(paints[0].height).toBe(240);
    expect(entry.running).toBe(true);
  });

  it("stop halts the loop (resumable), destroy tears the context down", async () => {
    await entry.init({ definition: tinyDefinition, externalParams: [] });
    vi.useFakeTimers();
    entry.start();
    vi.advanceTimersByTime(1000 / 30 * 2);
    entry.stop();
    expect(entry.running).toBe(false);
    const stopMovie = vi.fn();
    entry.context.addEventListener("stopMovie", stopMovie);
    entry.destroy();
    expect(entry.context).toBeNull();
    // paint stream stopped
    const paintsAfter = posts.filter((m) => m.kind === "paint").length;
    vi.advanceTimersByTime(1000 / 30 * 4);
    expect(posts.filter((m) => m.kind === "paint").length).toBe(paintsAfter);
  });

  it("goToFrame seeks the score; poll-lifecycle reports the frame", async () => {
    const def = {
      ...tinyDefinition,
      score: { frames: [
        { frame: 1, channels: { 1: { member: "Logo" } } },
        { frame: 2, channels: { 1: { member: "Logo" } } },
        { frame: 3, channels: { 1: { member: "Logo" } } },
      ] },
    };
    await entry.init({ definition: def, externalParams: [] });
    entry.goToFrame(3);
    entry.pollLifecycle();
    const lif = posts.findLast((m) => m.kind === "lifecycle");
    expect(lif.detail.frame).toBe(3);
  });

  it("routes input messages into _key/_mouse fields", async () => {
    await entry.init({ definition: tinyDefinition, externalParams: [] });
    entry.onMessage({ data: { kind: "keydown", key: "q", keyCode: 81 } });
    expect(entry.context.key.key).toBe("q");
    entry.onMessage({ data: { kind: "mousemove", clientX: 100, clientY: 50 } });
    expect(entry.context.mouse.mouseH).toBe(100);
    expect(entry.context.mouse.mouseV).toBe(240 - 50); // y-flip (bottom-left)
  });
});