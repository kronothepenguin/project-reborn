import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { _resetSingletons } from "../../subsystem/singletons.js";
import { the } from "../the-proxy.js";
import { Score } from "../../subsystem/score.js";

describe("the-proxy × Score wiring (004)", () => {
  beforeEach(() => _resetSingletons());
  afterEach(() => _resetSingletons());

  it("reads live playhead / label / tempo from the activated context score", () => {
    const ctx = new DirectorContext({
      tempo: 20,
      score: { frames: [{ marker: "intro" }, { channels: {} }, { marker: "loop" }] },
    });
    ctx.activate({});
    ctx.score.advance();
    expect(the.frame).toBe(1);
    expect(the.frameLabel).toBe("intro");
    expect(the.frameTempo).toBe(20);
    ctx.score.setTempo(45);
    expect(the.frameTempo).toBe(45);
  });

  it("empty-score defaults: frame 0, label '', tempo 30 (no context)", () => {
    expect(the.frame).toBe(0);
    expect(the.frameLabel).toBe("");
    expect(the.frameTempo).toBe(30);
  });

  it("the three rows stay read-only (writes throw)", () => {
    const ctx = new DirectorContext();
    ctx.activate({});
    expect(() => { the.frame = 3; }).toThrow();
    expect(() => { the.frameLabel = "x"; }).toThrow();
    expect(() => { the.frameTempo = 60; }).toThrow();
  });
});