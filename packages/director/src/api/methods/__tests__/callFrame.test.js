import { describe, it, expect, vi } from "vitest";
import { callFrame } from "../callFrame.js";
import { _movie } from "../../singletons.js";

describe("callFrame", () => {
  it("is exported as a function", () => {
    expect(typeof callFrame).toBe("function");
  });

  it("delegates to spriteRef.callFrame when given a sprite ref with the method", () => {
    const spriteRef = { callFrame: vi.fn() };
    callFrame(spriteRef, 10);
    expect(spriteRef.callFrame).toHaveBeenCalledWith(10);
  });

  it("accepts a string frame name", () => {
    const spriteRef = { callFrame: vi.fn() };
    callFrame(spriteRef, "intro");
    expect(spriteRef.callFrame).toHaveBeenCalledWith("intro");
  });

  it("resolves a numeric channel via _movie.sprite when no direct ref", () => {
    _movie._reset();
    const fakeSprite = { callFrame: vi.fn() };
    _movie._addSprite(fakeSprite);
    try {
      callFrame(1, 5);
      expect(fakeSprite.callFrame).toHaveBeenCalledWith(5);
    } finally {
      _movie._reset();
    }
  });

  it("does not throw on a missing sprite channel", () => {
    expect(() => callFrame(99999, 1)).not.toThrow();
  });

  it("matches the spec example shape (sprite 1 frame 10)", () => {
    const spriteRef = { callFrame: vi.fn() };
    callFrame(spriteRef, 10);
    expect(spriteRef.callFrame).toHaveBeenCalledWith(10);
  });
});
