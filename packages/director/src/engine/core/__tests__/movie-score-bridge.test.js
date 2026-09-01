import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { _resetSingletons, _movie } from "../../subsystem/singletons.js";

describe("MovieObject — Score bridge (004 R2)", () => {
  beforeEach(() => _resetSingletons());
  afterEach(() => _resetSingletons());

  it("go() reaches the Score frame navigation", () => {
    const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }, {}, { marker: "c" }] } });
    ctx.activate({});
    _movie.go("c");
    expect(ctx.score.frame).toBe(3);
    _movie.go(2);
    expect(ctx.score.frame).toBe(2);
  });

  it("goNext/goPrevious/goLoop also reach the Score", () => {
    const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }, { marker: "b" }, { marker: "c" }] } });
    ctx.activate({});
    _movie.goNext();
    expect(ctx.score.frame).toBe(1); // first marker (a)
    _movie.goNext();
    expect(ctx.score.frame).toBe(2); // next marker (b)
    _movie.goPrevious();
    expect(ctx.score.frame).toBe(1);
    _movie.goNext();
    _movie.goLoop();
    expect(ctx.score.frame).toBe(1);
  });

  it("puppetTempo() mutates the Score tempo", () => {
    const ctx = new DirectorContext({ tempo: 30 });
    ctx.activate({});
    _movie.puppetTempo(45);
    expect(ctx.score.tempo).toBe(45);
  });

  it("works without an activated context (default Score slot)", () => {
    const before = _movie.go;
    expect(() => _movie.go(1)).not.toThrow();
    expect(() => _movie.puppetTempo(30)).not.toThrow();
  });
});