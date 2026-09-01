import { describe, it, expect } from "vitest";
import { Color } from "../../../api/index.js";

const documentedMembers = ["red", "green", "blue"];

describe("Color", () => {
  it("exposes exactly the documented prototype surface (FR-004)", () => {
    const protoMembers = Object.getOwnPropertyNames(Color.prototype).filter(
      (p) => p !== "constructor"
    );
    expect(protoMembers.sort()).toEqual([...documentedMembers].sort());
  });

  it("has no undocumented convenience members (hex/rgb/equals removed)", () => {
    const instance = new Color();
    for (const key of ["hex", "rgb", "equals"]) {
      expect(key in instance).toBe(false);
      expect(key in Color.prototype).toBe(false);
    }
  });

  it("defaults to black (0,0,0)", () => {
    const c = new Color();
    expect(c.red).toBe(0);
    expect(c.green).toBe(0);
    expect(c.blue).toBe(0);
  });

  it("truncates channels to integers 0-255 on construction", () => {
    const c = new Color(-5, 300, 12.9);
    expect(c.red).toBe(0);
    expect(c.green).toBe(255);
    expect(c.blue).toBe(12);
  });

  it("truncates channels to integers 0-255 on assignment", () => {
    const c = new Color();
    c.red = -1;
    c.green = 256.7;
    c.blue = 3.5;
    expect(c.red).toBe(0);
    expect(c.green).toBe(255);
    expect(c.blue).toBe(3);
  });

  it("keeps in-range integer values unchanged", () => {
    const c = new Color(10, 128, 255);
    expect(c.red).toBe(10);
    expect(c.green).toBe(128);
    expect(c.blue).toBe(255);
  });
});
