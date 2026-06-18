import { describe, it, expect, vi } from "vitest";
import { goToFrame } from "../goToFrame.js";

describe("goToFrame", () => {
  it("is exported as a function", () => {
    expect(typeof goToFrame).toBe("function");
  });

  it("delegates to spriteRef.goToFrame", () => {
    const spriteRef = { goToFrame: vi.fn() };
    goToFrame(spriteRef, 10);
    expect(spriteRef.goToFrame).toHaveBeenCalledWith(10);
  });

  it("accepts a string label", () => {
    const spriteRef = { goToFrame: vi.fn() };
    goToFrame(spriteRef, "intro");
    expect(spriteRef.goToFrame).toHaveBeenCalledWith("intro");
  });

  it("does not throw on null sprite", () => {
    expect(() => goToFrame(null, 1)).not.toThrow();
  });

  it("matches the spec example shape (Navigate handler)", () => {
    const spriteRef = { goToFrame: vi.fn() };
    const Navigate = (whereTo) => goToFrame(spriteRef, whereTo);
    Navigate(5);
    expect(spriteRef.goToFrame).toHaveBeenCalledWith(5);
  });
});
