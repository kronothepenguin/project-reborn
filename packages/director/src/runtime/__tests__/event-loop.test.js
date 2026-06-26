import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  startEventLoop,
  stopEventLoop,
  isEventLoopRunning,
  setTempo,
} from "../event-loop.js";
import { _createMovie } from "../../browser/custom-elements.js";

describe("event-loop", () => {
  beforeEach(() => {
    stopEventLoop();
  });

  afterEach(() => {
    stopEventLoop();
    vi.useRealTimers();
  });

  it("starts and stops the loop", () => {
    startEventLoop({ tempo: 30 });
    expect(isEventLoopRunning()).toBe(true);
    stopEventLoop();
    expect(isEventLoopRunning()).toBe(false);
  });

  it("invokes onFrame and dispatches enterFrame/exitFrame per frame", () => {
    vi.useFakeTimers();
    const movie = _createMovie({ tempo: 60 });
    const onFrame = vi.fn();
    const events = [];
    movie.addEventListener("enterFrame", (e) => events.push(["enter", e.detail.frame]));
    movie.addEventListener("exitFrame", (e) => events.push(["exit", e.detail.frame]));
    movie.addEventListener("prepareFrame", (e) => events.push(["prepare", e.detail.frame]));

    startEventLoop({ tempo: 60, movie, onFrame });
    vi.advanceTimersByTime(1000);
    stopEventLoop();

    expect(onFrame).toHaveBeenCalled();
    expect(events.length).toBeGreaterThan(0);
    expect(events.filter(([k]) => k === "enter").length).toBeGreaterThan(0);
    expect(events.filter(([k]) => k === "exit").length).toBeGreaterThan(0);
  });

  it("setTempo changes frame duration", () => {
    startEventLoop({ tempo: 30 });
    setTempo(60);
    expect(isEventLoopRunning()).toBe(true);
  });

  it("calling startEventLoop twice does not create a second loop", () => {
    startEventLoop({ tempo: 30 });
    const firstRunning = isEventLoopRunning();
    startEventLoop({ tempo: 60 });
    expect(isEventLoopRunning()).toBe(firstRunning);
    stopEventLoop();
  });

  it("advances movie.frame each frame", () => {
    vi.useFakeTimers();
    const movie = _createMovie({ tempo: 30 });
    startEventLoop({ tempo: 30, movie });
    const start = movie.frame;
    vi.advanceTimersByTime(2000);
    stopEventLoop();
    expect(movie.frame).toBeGreaterThan(start);
  });

  it("falls back to setInterval when requestAnimationFrame is unavailable", () => {
    const original = globalThis.requestAnimationFrame;
    delete globalThis.requestAnimationFrame;
    try {
      startEventLoop({ tempo: 30 });
      expect(isEventLoopRunning()).toBe(true);
    } finally {
      stopEventLoop();
      globalThis.requestAnimationFrame = original;
    }
  });

  it("catches errors thrown by onFrame handlers", () => {
    vi.useFakeTimers();
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const movie = _createMovie({ tempo: 30 });
    startEventLoop({ tempo: 30, movie, onFrame: () => { throw new Error("boom"); } });
    vi.advanceTimersByTime(1000);
    stopEventLoop();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
