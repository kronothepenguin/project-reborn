import { describe, it, expect, afterEach } from "vitest";
import { DirectorContext } from "../../subsystem/context.js";
import { _getMovie } from "../../subsystem/singletons.js";
import { setActiveDirectorContext } from "../../subsystem/accessor.js";

describe("MovieObject — Score bridge (004 R2, 006 C8)", () => {
  afterEach(() => setActiveDirectorContext(null));

  it("go() reaches the Score frame navigation via the active context", () => {
    const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }, {}, { marker: "c" }] } });
    ctx.activate();
    _getMovie().go("c");
    expect(ctx.score.frame).toBe(3);
    _getMovie().go(2);
    expect(ctx.score.frame).toBe(2);
  });

  it("goNext/goPrevious/goLoop also reach the Score", () => {
    const ctx = new DirectorContext({ score: { frames: [{ marker: "a" }, { marker: "b" }, { marker: "c" }] } });
    ctx.activate();
    _getMovie().goNext();
    expect(ctx.score.frame).toBe(1); // first marker (a)
    _getMovie().goNext();
    expect(ctx.score.frame).toBe(2); // next marker (b)
    _getMovie().goPrevious();
    expect(ctx.score.frame).toBe(1);
    _getMovie().goNext();
    _getMovie().goLoop();
    expect(ctx.score.frame).toBe(1);
  });

  it("puppetTempo() mutates the Score tempo", () => {
    const ctx = new DirectorContext({ tempo: 30 });
    ctx.activate();
    _getMovie().puppetTempo(45);
    expect(ctx.score.tempo).toBe(45);
  });

  it("works without an activated context (default no-op)", () => {
    expect(() => _getMovie().go(1)).not.toThrow();
    expect(() => _getMovie().puppetTempo(30)).not.toThrow();
  });
});