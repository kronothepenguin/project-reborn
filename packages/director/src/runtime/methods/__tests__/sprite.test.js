import { describe, it, expect, beforeEach } from "vitest";
import { sprite } from "../sprite.js";
import { _movie } from "../../singletons.js";
import { SpriteObject } from "../../objects/sprite.js";

describe("sprite", () => {
  beforeEach(() => {
    _movie._reset();
  });

  function addSprite(num, name = "") {
    const s = new SpriteObject(num);
    if (name) s.name = name;
    _movie._addSprite(s);
    return s;
  }

  it("is exported as a function", () => {
    expect(typeof sprite).toBe("function");
  });

  it("returns null when no sprites exist", () => {
    expect(sprite(1)).toBeNull();
  });

  it("accesses sprite by channel number (1-based)", () => {
    const s = addSprite(1);
    expect(sprite(1)).toBe(s);
  });

  it("accesses sprite by name", () => {
    const s = addSprite(3, "Cave");
    expect(sprite("Cave")).toBe(s);
  });

  it("returns null for unknown channel", () => {
    addSprite(1);
    expect(sprite(99)).toBeNull();
  });

  it("returns null for unknown name", () => {
    addSprite(1, "Cave");
    expect(sprite("Bog")).toBeNull();
  });

  it("accepts numeric string for channel", () => {
    const s = addSprite(1);
    expect(sprite("1")).toBe(s);
  });
});
