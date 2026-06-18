import { describe, it, expect, vi } from "vitest";
import { maximize } from "../maximize.js";

describe("maximize", () => {
  it("is exported as a function", () => {
    expect(typeof maximize).toBe("function");
  });

  it("calls maximize on the window ref", () => {
    const win = { maximize: vi.fn() };
    maximize(win);
    expect(win.maximize).toHaveBeenCalledTimes(1);
  });

  it("does not throw on null window", () => {
    expect(() => maximize(null)).not.toThrow();
  });

  it("matches the spec example shape (Artists window)", () => {
    const Artists = { sizeState: "normal", maximize: vi.fn() };
    if (Artists.sizeState !== "maximized") {
      maximize(Artists);
    }
    expect(Artists.maximize).toHaveBeenCalled();
  });
});
