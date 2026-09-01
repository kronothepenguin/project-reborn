import { describe, it, expect } from "vitest";
import { Color, color } from "../color.js";

describe("Color", () => {
  describe("constructor", () => {
    it("creates instance with default values", () => {
      const c = new Color();
      expect(c).toBeInstanceOf(Color);
      expect(c.red).toBe(0);
      expect(c.green).toBe(0);
      expect(c.blue).toBe(0);
    });

    it("creates instance with provided values", () => {
      const c = new Color(255, 128, 64);
      expect(c.red).toBe(255);
      expect(c.green).toBe(128);
      expect(c.blue).toBe(64);
    });

    it("clamps values above 255", () => {
      const c = new Color(300, 400, 500);
      expect(c.red).toBe(255);
      expect(c.green).toBe(255);
      expect(c.blue).toBe(255);
    });

    it("clamps negative values to 0", () => {
      const c = new Color(-10, -50, -100);
      expect(c.red).toBe(0);
      expect(c.green).toBe(0);
      expect(c.blue).toBe(0);
    });

    it("truncates decimal values", () => {
      const c = new Color(100.9, 50.5, 25.1);
      expect(c.red).toBe(100);
      expect(c.green).toBe(50);
      expect(c.blue).toBe(25);
    });
  });

  describe("red property", () => {
    it("gets red", () => {
      const c = new Color(255, 128, 64);
      expect(c.red).toBe(255);
    });

    it("sets red", () => {
      const c = new Color(0, 0, 0);
      c.red = 200;
      expect(c.red).toBe(200);
    });

    it("clamps red above 255", () => {
      const c = new Color(0, 0, 0);
      c.red = 300;
      expect(c.red).toBe(255);
    });

    it("clamps red below 0", () => {
      const c = new Color(100, 0, 0);
      c.red = -50;
      expect(c.red).toBe(0);
    });
  });

  describe("green property", () => {
    it("gets green", () => {
      const c = new Color(255, 128, 64);
      expect(c.green).toBe(128);
    });

    it("sets green", () => {
      const c = new Color(0, 0, 0);
      c.green = 150;
      expect(c.green).toBe(150);
    });

    it("clamps green above 255", () => {
      const c = new Color(0, 0, 0);
      c.green = 500;
      expect(c.green).toBe(255);
    });

    it("clamps green below 0", () => {
      const c = new Color(0, 100, 0);
      c.green = -10;
      expect(c.green).toBe(0);
    });
  });

  describe("blue property", () => {
    it("gets blue", () => {
      const c = new Color(255, 128, 64);
      expect(c.blue).toBe(64);
    });

    it("sets blue", () => {
      const c = new Color(0, 0, 0);
      c.blue = 255;
      expect(c.blue).toBe(255);
    });

    it("clamps blue above 255", () => {
      const c = new Color(0, 0, 0);
      c.blue = 999;
      expect(c.blue).toBe(255);
    });

    it("clamps blue below 0", () => {
      const c = new Color(0, 0, 50);
      c.blue = -100;
      expect(c.blue).toBe(0);
    });
  });
});

describe("color() factory", () => {
  it("creates color with given RGB values", () => {
    const c = color(137, 200, 50);
    expect(c).toBeInstanceOf(Color);
    expect(c.red).toBe(137);
    expect(c.green).toBe(200);
    expect(c.blue).toBe(50);
  });

  it("creates black color", () => {
    const c = color(0, 0, 0);
    expect(c.red).toBe(0);
    expect(c.green).toBe(0);
    expect(c.blue).toBe(0);
  });

  it("creates white color", () => {
    const c = color(255, 255, 255);
    expect(c.red).toBe(255);
    expect(c.green).toBe(255);
    expect(c.blue).toBe(255);
  });

  it("clamps out-of-range values", () => {
    const c = color(300, -10, 128);
    expect(c.red).toBe(255);
    expect(c.green).toBe(0);
    expect(c.blue).toBe(128);
  });
});

describe("Color.hex", () => {
  it("formats black as #000000", () => {
    expect(new Color(0, 0, 0).hex).toBe("#000000");
  });

  it("formats white as #ffffff", () => {
    expect(new Color(255, 255, 255).hex).toBe("#ffffff");
  });

  it("formats red as #ff0000", () => {
    expect(new Color(255, 0, 0).hex).toBe("#ff0000");
  });

  it("zero-pads single hex digits", () => {
    expect(new Color(1, 2, 15).hex).toBe("#01020f");
  });

  it("reflects updates to red/green/blue", () => {
    const c = new Color(0, 0, 0);
    c.red = 16;
    c.green = 32;
    c.blue = 48;
    expect(c.hex).toBe("#102030");
  });
});

describe("Color.rgb", () => {
  it("formats black as rgb(0, 0, 0)", () => {
    expect(new Color(0, 0, 0).rgb).toBe("rgb(0, 0, 0)");
  });

  it("formats white as rgb(255, 255, 255)", () => {
    expect(new Color(255, 255, 255).rgb).toBe("rgb(255, 255, 255)");
  });

  it("formats mixed channels", () => {
    expect(new Color(124, 22, 233).rgb).toBe("rgb(124, 22, 233)");
  });

  it("reflects updates to red/green/blue", () => {
    const c = new Color(10, 20, 30);
    c.red = 40;
    expect(c.rgb).toBe("rgb(40, 20, 30)");
  });
});

describe("Color.equals", () => {
  it("returns true for two Colors with the same RGB", () => {
    const a = new Color(10, 20, 30);
    const b = new Color(10, 20, 30);
    expect(a.equals(b)).toBe(true);
  });

  it("returns false for Colors with different RGB", () => {
    const a = new Color(10, 20, 30);
    const b = new Color(10, 20, 31);
    expect(a.equals(b)).toBe(false);
  });

  it("returns true for the same instance", () => {
    const a = new Color(5, 6, 7);
    expect(a.equals(a)).toBe(true);
  });

  it("returns false for null or undefined", () => {
    const a = new Color(0, 0, 0);
    expect(a.equals(null)).toBe(false);
    expect(a.equals(undefined)).toBe(false);
  });

  it("returns true for a plain object with matching red/green/blue", () => {
    const a = new Color(50, 100, 150);
    expect(a.equals({ red: 50, green: 100, blue: 150 })).toBe(true);
  });

  it("returns false for a plain object with mismatched components", () => {
    const a = new Color(50, 100, 150);
    expect(a.equals({ red: 50, green: 100, blue: 151 })).toBe(false);
  });

  it("returns false for objects missing color components", () => {
    const a = new Color(50, 100, 150);
    expect(a.equals({ red: 50, green: 100 })).toBe(false);
    expect(a.equals({})).toBe(false);
  });

  it("is symmetric", () => {
    const a = new Color(1, 2, 3);
    const b = new Color(1, 2, 3);
    expect(a.equals(b)).toBe(b.equals(a));
  });
});

describe("color() factory hex/rgb/equals parity", () => {
  it("factory returns Color with same hex as constructor", () => {
    const a = color(10, 20, 30);
    const b = new Color(10, 20, 30);
    expect(a.hex).toBe(b.hex);
    expect(a.rgb).toBe(b.rgb);
  });

  it("factory returns Color equal to constructor", () => {
    expect(color(10, 20, 30).equals(new Color(10, 20, 30))).toBe(true);
  });
});
