import { describe, it, expect } from "vitest";
import { Rect, rect } from "../../../api/index.js";

describe("Rect", () => {
  it("exposes only the documented edge fields on the prototype surface", () => {
    const protoMembers = Object.getOwnPropertyNames(Rect.prototype).filter(
      (p) => p !== "constructor"
    );
    expect(protoMembers).toEqual([]);
  });

  it("defaults to (0,0,0,0)", () => {
    const r = new Rect();
    expect(r.left).toBe(0);
    expect(r.top).toBe(0);
    expect(r.right).toBe(0);
    expect(r.bottom).toBe(0);
  });

  it("stores left/top/right/bottom fields", () => {
    const r = new Rect(40, 30, 90, 70);
    expect(r.left).toBe(40);
    expect(r.top).toBe(30);
    expect(r.right).toBe(90);
    expect(r.bottom).toBe(70);
  });

  it("has no width/height members (consumer-derived per docs)", () => {
    const r = new Rect(40, 30, 90, 70);
    expect("width" in r).toBe(false);
    expect("height" in r).toBe(false);
    expect("width" in Rect.prototype).toBe(false);
  });

  it("width is consumer-derived via property syntax", () => {
    const r = new Rect(40, 30, 90, 70);
    expect(r.right - r.left).toBe(50);
  });

  describe("rect() creator proxy (list syntax, amendment 2026-08-31)", () => {
    it("reads edges via [1]..[4]", () => {
      const r = rect(40, 30, 90, 70);
      expect(r[1]).toBe(40);
      expect(r[2]).toBe(30);
      expect(r[3]).toBe(90);
      expect(r[4]).toBe(70);
    });

    it("width is consumer-derived via list syntax (myRect[3] - myRect[1])", () => {
      const r = rect(40, 30, 90, 70);
      expect(r[3] - r[1]).toBe(50);
    });

    it("writes edges via [1]..[4]", () => {
      const r = rect(0, 0, 0, 0);
      r[1] = 10;
      r[2] = 20;
      r[3] = 30;
      r[4] = 40;
      expect(r.left).toBe(10);
      expect(r.top).toBe(20);
      expect(r.right).toBe(30);
      expect(r.bottom).toBe(40);
    });
  });
});
