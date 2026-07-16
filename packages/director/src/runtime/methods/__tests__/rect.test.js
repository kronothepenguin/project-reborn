import { describe, it, expect } from "vitest";
import { rect } from "../rect.js";
import { Rect } from "../../index.js";

describe("rect", () => {
  it("is exported as a function", () => {
    expect(typeof rect).toBe("function");
  });

  it("returns a Rect instance", () => {
    expect(rect(0, 0, 10, 10)).toBeInstanceOf(Rect);
  });

  it("exposes left, top, right, bottom from parameters", () => {
    const r = rect(10, 20, 100, 200);
    expect(r.left).toBe(10);
    expect(r.top).toBe(20);
    expect(r.right).toBe(100);
    expect(r.bottom).toBe(200);
  });

  it("supports list-style access [1]=left [2]=top [3]=right [4]=bottom", () => {
    const r = rect(40, 30, 90, 70);
    expect(r[1]).toBe(40);
    expect(r[2]).toBe(30);
    expect(r[3]).toBe(90);
    expect(r[4]).toBe(70);
  });

  it("computes width via list-style: right - left", () => {
    const r = rect(40, 30, 90, 70);
    expect(r[3] - r[1]).toBe(50);
  });

  it("supports writing through list-style index", () => {
    const r = rect(0, 0, 0, 0);
    r[1] = 10;
    r[3] = 60;
    expect(r.left).toBe(10);
    expect(r.right).toBe(60);
  });

  it("mutates properties via setters", () => {
    const r = rect(0, 0, 0, 0);
    r.left = 7;
    expect(r.left).toBe(7);
  });

  it("matches the spec example shape (rect(100, 150, 300, 400))", () => {
    const newArea = rect(100, 150, 300, 400);
    expect(newArea.left).toBe(100);
    expect(newArea.right).toBe(300);
  });
});
