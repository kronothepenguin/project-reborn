import { describe, it, expect, beforeEach } from "vitest";
import { sprite } from "../sprite.js";
import { _movie } from "../../core/movie-ref.js";
import { SpriteRef } from "../../core/sprite-ref.js";

describe("sprite", () => {
  beforeEach(() => {
    _movie._reset();
  });

  function addSprite(num, name = "") {
    const s = new SpriteRef(num);
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
    expect(sprite(1).num).toBe(1);
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
