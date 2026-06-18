import { describe, it, expect } from "vitest";
import { image } from "../image.js";

describe("image", () => {
  it("is exported as a function", () => {
    expect(typeof image).toBe("function");
  });

  it("takes three parameters (width, height, bitDepth)", () => {
    expect(image.length).toBe(3);
  });

  it("returns an object with width, height, bitDepth", () => {
    const img = image(200, 100, 8);
    expect(img.width).toBe(200);
    expect(img.height).toBe(100);
    expect(img.bitDepth).toBe(8);
  });

  it("matches the spec example shape (8-bit 200x200)", () => {
    const img = image(200, 200, 8);
    expect(img.width).toBe(200);
    expect(img.height).toBe(200);
    expect(img.bitDepth).toBe(8);
  });

  it("coerces numeric strings", () => {
    const img = image("100", "50", "16");
    expect(img.width).toBe(100);
    expect(img.bitDepth).toBe(16);
  });
});
