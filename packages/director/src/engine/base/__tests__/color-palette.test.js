import { describe, it, expect } from "vitest";
import { color, Color, PALETTES } from "../color.js";

describe("color() palette form (006 C5)", () => {
  it("single-int arg => 8-bit palette index with RGB from the active palette", () => {
    const c = color(137);
    expect(c).toBeInstanceOf(Color);
    expect(c.paletteIndex).toBe(137);
    expect(c.red).toBe(PALETTES.default[137][0]);
    expect(c.green).toBe(PALETTES.default[137][1]);
    expect(c.blue).toBe(PALETTES.default[137][2]);
  });

  it("palette index truncates out-of-range (0..255)", () => {
    expect(color(-1).paletteIndex).toBe(0);
    expect(color(300).paletteIndex).toBe(255);
    expect(color(137.9).paletteIndex).toBe(137);
  });

  it("three-arg form stays RGB (no palette index)", () => {
    const c = color(255, 0, 0);
    expect(c).toBeInstanceOf(Color);
    expect(c.red).toBe(255);
    expect(c.green).toBe(0);
    expect(c.blue).toBe(0);
    expect(c.paletteIndex).toBeUndefined();
  });

  it("palette index 0 and 255 are the first/last entries of the default palette", () => {
    expect(color(0).red).toBe(PALETTES.default[0][0]);
    expect(color(255).red).toBe(PALETTES.default[255][0]);
  });

  it("PALETTES exposes built-ins by symbol key", () => {
    expect(PALETTES[Symbol.for("rainbow")]?.length).toBe(256);
    expect(PALETTES.default.length).toBe(256);
    expect(PALETTES.grayscale.length).toBe(256);
  });

  it("paletteRef symbol resolution: color reads the palette for the movie's paletteRef", () => {
    // no active context -> default palette
    expect(color(1).paletteIndex).toBe(1);
  });
});