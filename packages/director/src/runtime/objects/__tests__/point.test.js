import { describe, it, expect } from "vitest";
import { Point, point } from "../../types/point.js";

describe("Point", () => {
  describe("constructor", () => {
    it("creates instance with default values", () => {
      const pt = new Point();
      expect(pt).toBeInstanceOf(Point);
      expect(pt.locH).toBe(0);
      expect(pt.locV).toBe(0);
    });

    it("creates instance with provided values", () => {
      const pt = new Point(100, 200);
      expect(pt.locH).toBe(100);
      expect(pt.locV).toBe(200);
    });

    it("creates instance with negative values", () => {
      const pt = new Point(-50, -75);
      expect(pt.locH).toBe(-50);
      expect(pt.locV).toBe(-75);
    });
  });

  describe("locH property", () => {
    it("gets locH", () => {
      const pt = new Point(100, 200);
      expect(pt.locH).toBe(100);
    });

    it("sets locH", () => {
      const pt = new Point(100, 200);
      pt.locH = 150;
      expect(pt.locH).toBe(150);
    });

    it("sets locH to negative", () => {
      const pt = new Point(100, 200);
      pt.locH = -10;
      expect(pt.locH).toBe(-10);
    });

    it("sets locH to zero", () => {
      const pt = new Point(100, 200);
      pt.locH = 0;
      expect(pt.locH).toBe(0);
    });
  });

  describe("locV property", () => {
    it("gets locV", () => {
      const pt = new Point(100, 200);
      expect(pt.locV).toBe(200);
    });

    it("sets locV", () => {
      const pt = new Point(100, 200);
      pt.locV = 250;
      expect(pt.locV).toBe(250);
    });

    it("sets locV to negative", () => {
      const pt = new Point(100, 200);
      pt.locV = -20;
      expect(pt.locV).toBe(-20);
    });

    it("sets locV to zero", () => {
      const pt = new Point(100, 200);
      pt.locV = 0;
      expect(pt.locV).toBe(0);
    });
  });
});

describe("point() factory", () => {
  it("creates point with given coordinates", () => {
    const pt = point(250, 400);
    expect(pt.locH).toBe(250);
    expect(pt.locV).toBe(400);
  });

  it("creates point with zero coordinates", () => {
    const pt = point(0, 0);
    expect(pt.locH).toBe(0);
    expect(pt.locV).toBe(0);
  });

  it("creates point with negative coordinates", () => {
    const pt = point(-10, -20);
    expect(pt.locH).toBe(-10);
    expect(pt.locV).toBe(-20);
  });

  it("allows setting locH after creation", () => {
    const pt = point(100, 200);
    pt.locH = pt.locH + 5;
    expect(pt.locH).toBe(105);
  });

  it("allows setting locV after creation", () => {
    const pt = point(100, 200);
    pt.locV = pt.locV + 10;
    expect(pt.locV).toBe(210);
  });
});

describe("numeric index access via Proxy", () => {
  it("accesses locH via pt[1]", () => {
    const pt = point(100, 200);
    expect(pt[1]).toBe(100);
  });

  it("accesses locV via pt[2]", () => {
    const pt = point(100, 200);
    expect(pt[2]).toBe(200);
  });

  it("sets locH via pt[1]", () => {
    const pt = point(100, 200);
    pt[1] = 150;
    expect(pt.locH).toBe(150);
    expect(pt[1]).toBe(150);
  });

  it("sets locV via pt[2]", () => {
    const pt = point(100, 200);
    pt[2] = 250;
    expect(pt.locV).toBe(250);
    expect(pt[2]).toBe(250);
  });

  it("supports string index access", () => {
    const pt = point(100, 200);
    expect(pt["1"]).toBe(100);
    expect(pt["2"]).toBe(200);
  });

  it("supports has check for numeric indices", () => {
    const pt = point(100, 200);
    expect(1 in pt).toBe(true);
    expect(2 in pt).toBe(true);
  });
});
