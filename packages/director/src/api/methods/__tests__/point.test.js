import { describe, it, expect } from "vitest";
import { point } from "../point.js";
import { Point } from "../../index.js";

describe("point", () => {
  it("is exported as a function", () => {
    expect(typeof point).toBe("function");
  });

  it("returns a Point instance", () => {
    expect(point(10, 20)).toBeInstanceOf(Point);
  });

  it("exposes locH and locV from the parameters", () => {
    const p = point(100, 200);
    expect(p.locH).toBe(100);
    expect(p.locV).toBe(200);
  });

  it("supports list-style access for [1]=locH, [2]=locV", () => {
    const p = point(50, 75);
    expect(p[1]).toBe(50);
    expect(p[2]).toBe(75);
  });

  it("supports writing through list-style index", () => {
    const p = point(0, 0);
    p[1] = 30;
    p[2] = 40;
    expect(p.locH).toBe(30);
    expect(p.locV).toBe(40);
  });

  it("mutates locH/locV via setters", () => {
    const p = point(0, 0);
    p.locH = 5;
    expect(p.locH).toBe(5);
  });

  it("matches the spec example shape", () => {
    const lastLocation = point(250, 400);
    expect(lastLocation.locH).toBe(250);
    expect(lastLocation.locV).toBe(400);
  });

  it("allows negative coordinates", () => {
    const p = point(-10, -20);
    expect(p.locH).toBe(-10);
    expect(p.locV).toBe(-20);
  });
});
