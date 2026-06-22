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
