import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { startEventLoop, stopEventLoop, isEventLoopRunning } from "../event-loop.js";
import { DirectorContext } from "../../engine/subsystem/context.js";

describe("event-loop rewired to ctx.frameStep (008 R3)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    stopEventLoop();
    vi.useRealTimers();
  });

  it("each tick calls ctx.frameStep (advance → events) and the render hook", () => {
    const ctx = new DirectorContext({ score: { frames: [{}, {}, {}] } });
    ctx.activate();
    const frameStep = vi.spyOn(ctx, "frameStep");
    const onFrame = vi.fn();
    startEventLoop({ tempo: 30, movie: ctx, onFrame });
    vi.advanceTimersByTime(100 / 30 * 10);
    expect(frameStep).toHaveBeenCalled();
    expect(onFrame).toHaveBeenCalled();
  });

  it("frameStep advances the playhead per tick", () => {
    const ctx = new DirectorContext({ score: { frames: [{}, {}] } });
    ctx.activate();
    startEventLoop({ tempo: 30, movie: ctx });
    vi.advanceTimersByTime(1000 / 30 * 3);
    expect(ctx.score.frame).toBeGreaterThan(0);
  });

  it("stop halts the loop; start resumes", () => {
    const ctx = new DirectorContext({ score: { frames: [{}, {}] } });
    ctx.activate();
    const onFrame = vi.fn();
    startEventLoop({ tempo: 30, movie: ctx, onFrame });
    vi.advanceTimersByTime(1000 / 30 * 3);
    const after3 = onFrame.mock.calls.length;
    stopEventLoop();
    const frozen = onFrame.mock.calls.length;
    vi.advanceTimersByTime(1000 / 30 * 3);
    expect(onFrame.mock.calls.length).toBe(frozen);
    startEventLoop({ tempo: 30, movie: ctx, onFrame });
    vi.advanceTimersByTime(1000 / 30 * 3);
    expect(onFrame.mock.calls.length).toBeGreaterThan(after3);
  });
});