import { describe, it, expect } from "vitest";
import { Point, point } from "../../../api/index.js";

describe("Point", () => {
  it("exposes only the documented locH/locV fields on the prototype surface", () => {
    const protoMembers = Object.getOwnPropertyNames(Point.prototype).filter(
      (p) => p !== "constructor"
    );
    expect(protoMembers).toEqual([]);
  });

  it("defaults to (0,0)", () => {
    const p = new Point();
    expect(p.locH).toBe(0);
    expect(p.locV).toBe(0);
  });

  it("stores locH/locV fields", () => {
    const p = new Point(10, 20);
    expect(p.locH).toBe(10);
    expect(p.locV).toBe(20);
  });

  describe("point() creator proxy (list syntax, amendment 2026-08-31)", () => {
    it("reads locH/locV via [1]/[2]", () => {
      const p = point(10, 20);
      expect(p[1]).toBe(10);
      expect(p[2]).toBe(20);
    });

    it("writes locH/locV via [1]/[2]", () => {
      const p = point(10, 20);
      p[1] = 30;
      p[2] = 40;
      expect(p.locH).toBe(30);
      expect(p.locV).toBe(40);
    });

    it("keeps property access working", () => {
      const p = point(5, 6);
      expect(p.locH).toBe(5);
      expect(p.locV).toBe(6);
    });
  });
});
