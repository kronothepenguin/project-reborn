import { describe, it, expect, beforeEach } from "vitest";
import { DirectorContext } from "../context.js";
import { Score } from "../score.js";

const cell = (overrides = {}) => ({ member: "m1", ...overrides });

describe("lifecycle — frameStep dispatch order", () => {
  let ctx;
  const order = [];

  beforeEach(() => {
    ctx = new DirectorContext();
    order.length = 0;
  });

  const trace = (timeline) => {
    for (const name of ["prepareFrame", "enterFrame", "beginSprite", "endSprite", "exitFrame"]) {
      ctx.addEventListener(name, (e) => timeline.push(e));
    }
  };

  it("empty score: frame events only, in order", () => {
    trace(order);
    ctx.frameStep();
    expect(order.map((e) => e.type)).toEqual(["prepareFrame", "enterFrame", "exitFrame"]);
    expect(order[0].detail.frame).toBe(0);
  });

  it("populated score: beginSprite/endSprite per channel ascending, nested", () => {
    ctx.score = new Score({ frames: [{ channels: { 1: cell(), 6: cell({ z: 2 }) } }] });
    trace(order);
    ctx.frameStep();
    expect(order.map((e) => e.type)).toEqual([
      "prepareFrame",
      "enterFrame",
      "beginSprite",
      "endSprite",
      "beginSprite",
      "endSprite",
      "exitFrame",
    ]);
    expect(order[2].detail.channel).toBe(1);
    expect(order[4].detail.channel).toBe(6);
    expect(order[2].detail.cell).toEqual({ member: "m1" });
  });

  it("advance() runs first: the event frame reflects the advanced playhead", () => {
    ctx.score = new Score({ frames: [{}, {}, {}] });
    trace(order);
    ctx.frameStep();
    expect(order[0].detail.frame).toBe(1);
    ctx.frameStep();
    expect(order[4].detail.frame).toBe(2);
  });
});

describe("lifecycle — idle / timeout hooks", () => {
  it("idle and timeout dispatch on the context", () => {
    const ctx = new DirectorContext();
    const seen = [];
    ctx.addEventListener("idle", () => seen.push("idle"));
    ctx.addEventListener("timeout", () => seen.push("timeout"));
    ctx.idle();
    ctx.timeout();
    expect(seen).toEqual(["idle", "timeout"]);
  });
});