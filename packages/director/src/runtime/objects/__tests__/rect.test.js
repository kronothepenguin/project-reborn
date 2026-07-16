import { describe, it, expect } from "vitest";
import { Rect, rect } from "../../types/rect.js";

describe("Rect", () => {
  describe("constructor", () => {
    it("creates instance with default values", () => {
      const r = new Rect();
      expect(r).toBeInstanceOf(Rect);
      expect(r.left).toBe(0);
      expect(r.top).toBe(0);
      expect(r.right).toBe(0);
      expect(r.bottom).toBe(0);
    });

    it("creates instance with provided values", () => {
      const r = new Rect(10, 20, 100, 200);
      expect(r.left).toBe(10);
      expect(r.top).toBe(20);
      expect(r.right).toBe(100);
      expect(r.bottom).toBe(200);
    });

    it("creates instance with negative values", () => {
      const r = new Rect(-50, -75, -10, -5);
      expect(r.left).toBe(-50);
      expect(r.top).toBe(-75);
      expect(r.right).toBe(-10);
      expect(r.bottom).toBe(-5);
    });
  });

  describe("left property", () => {
    it("gets left", () => {
      const r = new Rect(10, 20, 100, 200);
      expect(r.left).toBe(10);
    });

    it("sets left", () => {
      const r = new Rect(10, 20, 100, 200);
      r.left = 50;
      expect(r.left).toBe(50);
    });

    it("sets left to negative", () => {
      const r = new Rect(10, 20, 100, 200);
      r.left = -10;
      expect(r.left).toBe(-10);
    });

    it("sets left to zero", () => {
      const r = new Rect(10, 20, 100, 200);
      r.left = 0;
      expect(r.left).toBe(0);
    });
  });

  describe("top property", () => {
    it("gets top", () => {
      const r = new Rect(10, 20, 100, 200);
      expect(r.top).toBe(20);
    });

    it("sets top", () => {
      const r = new Rect(10, 20, 100, 200);
      r.top = 60;
      expect(r.top).toBe(60);
    });

    it("sets top to negative", () => {
      const r = new Rect(10, 20, 100, 200);
      r.top = -20;
      expect(r.top).toBe(-20);
    });

    it("sets top to zero", () => {
      const r = new Rect(10, 20, 100, 200);
      r.top = 0;
      expect(r.top).toBe(0);
    });
  });

  describe("right property", () => {
    it("gets right", () => {
      const r = new Rect(10, 20, 100, 200);
      expect(r.right).toBe(100);
    });

    it("sets right", () => {
      const r = new Rect(10, 20, 100, 200);
      r.right = 150;
      expect(r.right).toBe(150);
    });

    it("sets right to negative", () => {
      const r = new Rect(10, 20, 100, 200);
      r.right = -100;
      expect(r.right).toBe(-100);
    });

    it("sets right to zero", () => {
      const r = new Rect(10, 20, 100, 200);
      r.right = 0;
      expect(r.right).toBe(0);
    });
  });

  describe("bottom property", () => {
    it("gets bottom", () => {
      const r = new Rect(10, 20, 100, 200);
      expect(r.bottom).toBe(200);
    });

    it("sets bottom", () => {
      const r = new Rect(10, 20, 100, 200);
      r.bottom = 300;
      expect(r.bottom).toBe(300);
    });

    it("sets bottom to negative", () => {
      const r = new Rect(10, 20, 100, 200);
      r.bottom = -200;
      expect(r.bottom).toBe(-200);
    });

    it("sets bottom to zero", () => {
      const r = new Rect(10, 20, 100, 200);
      r.bottom = 0;
      expect(r.bottom).toBe(0);
    });
  });
});

describe("rect() factory", () => {
  it("creates rect with given coordinates", () => {
    const r = rect(40, 30, 90, 70);
    expect(r.left).toBe(40);
    expect(r.top).toBe(30);
    expect(r.right).toBe(90);
    expect(r.bottom).toBe(70);
  });

  it("creates rect with zero coordinates", () => {
    const r = rect(0, 0, 0, 0);
    expect(r.left).toBe(0);
    expect(r.top).toBe(0);
    expect(r.right).toBe(0);
    expect(r.bottom).toBe(0);
  });

  it("creates rect with negative coordinates", () => {
    const r = rect(-10, -20, -30, -40);
    expect(r.left).toBe(-10);
    expect(r.top).toBe(-20);
    expect(r.right).toBe(-30);
    expect(r.bottom).toBe(-40);
  });

  it("allows setting left after creation", () => {
    const r = rect(100, 150, 300, 400);
    r.left = r.left + 5;
    expect(r.left).toBe(105);
  });

  it("allows setting top after creation", () => {
    const r = rect(100, 150, 300, 400);
    r.top = r.top + 10;
    expect(r.top).toBe(160);
  });

  it("allows setting right after creation", () => {
    const r = rect(100, 150, 300, 400);
    r.right = r.right + 50;
    expect(r.right).toBe(350);
  });

  it("allows setting bottom after creation", () => {
    const r = rect(100, 150, 300, 400);
    r.bottom = r.bottom + 100;
    expect(r.bottom).toBe(500);
  });

  it("computes width via property syntax", () => {
    const r = rect(40, 30, 90, 70);
    expect(r.right - r.left).toBe(50);
  });

  it("computes width via index syntax", () => {
    const r = rect(40, 30, 90, 70);
    expect(r[3] - r[1]).toBe(50);
  });
});

describe("numeric index access via Proxy", () => {
  it("accesses left via r[1]", () => {
    const r = rect(10, 20, 100, 200);
    expect(r[1]).toBe(10);
  });

  it("accesses top via r[2]", () => {
    const r = rect(10, 20, 100, 200);
    expect(r[2]).toBe(20);
  });

  it("accesses right via r[3]", () => {
    const r = rect(10, 20, 100, 200);
    expect(r[3]).toBe(100);
  });

  it("accesses bottom via r[4]", () => {
    const r = rect(10, 20, 100, 200);
    expect(r[4]).toBe(200);
  });

  it("sets left via r[1]", () => {
    const r = rect(10, 20, 100, 200);
    r[1] = 50;
    expect(r.left).toBe(50);
    expect(r[1]).toBe(50);
  });

  it("sets top via r[2]", () => {
    const r = rect(10, 20, 100, 200);
    r[2] = 60;
    expect(r.top).toBe(60);
    expect(r[2]).toBe(60);
  });

  it("sets right via r[3]", () => {
    const r = rect(10, 20, 100, 200);
    r[3] = 150;
    expect(r.right).toBe(150);
    expect(r[3]).toBe(150);
  });

  it("sets bottom via r[4]", () => {
    const r = rect(10, 20, 100, 200);
    r[4] = 300;
    expect(r.bottom).toBe(300);
    expect(r[4]).toBe(300);
  });

  it("supports string index access", () => {
    const r = rect(10, 20, 100, 200);
    expect(r["1"]).toBe(10);
    expect(r["2"]).toBe(20);
    expect(r["3"]).toBe(100);
    expect(r["4"]).toBe(200);
  });

  it("supports has check for numeric indices", () => {
    const r = rect(10, 20, 100, 200);
    expect(1 in r).toBe(true);
    expect(2 in r).toBe(true);
    expect(3 in r).toBe(true);
    expect(4 in r).toBe(true);
  });
});
