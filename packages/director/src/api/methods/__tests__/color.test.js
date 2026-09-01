import { describe, it, expect } from "vitest";
import { color } from "../color.js";
import { Color } from "../../index.js";

describe("color", () => {
  it("is exported as a function", () => {
    expect(typeof color).toBe("function");
  });

  it("returns a Color instance with RGB", () => {
    expect(color(255, 128, 0)).toBeInstanceOf(Color);
  });

  it("exposes red, green, blue from parameters", () => {
    const c = color(255, 128, 0);
    expect(c.red).toBe(255);
    expect(c.green).toBe(128);
    expect(c.blue).toBe(0);
  });

  it("clamps values above 255 to 255", () => {
    const c = color(300, 999, 500);
    expect(c.red).toBe(255);
    expect(c.green).toBe(255);
    expect(c.blue).toBe(255);
  });

  it("clamps negative values to 0", () => {
    const c = color(-1, -50, -99);
    expect(c.red).toBe(0);
    expect(c.green).toBe(0);
    expect(c.blue).toBe(0);
  });

  it("treats single-arg call as 8-bit palette index (grayscale mapping)", () => {
    const c = color(137);
    expect(c).toBeInstanceOf(Color);
    expect(c.red).toBe(137);
    expect(c.green).toBe(137);
    expect(c.blue).toBe(137);
  });

  it("clamps single palette index above 255 to 255", () => {
    const c = color(500);
    expect(c.red).toBe(255);
  });

  it("matches the spec example shape (color(255, 128, 0))", () => {
    const c = color(255, 128, 0);
    expect(c.red).toBe(255);
    expect(c.green).toBe(128);
    expect(c.blue).toBe(0);
  });
});
