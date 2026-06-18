import { describe, it, expect, vi } from "vitest";
import { flashToStage } from "../flashToStage.js";

describe("flashToStage", () => {
  it("is exported as a function", () => {
    expect(typeof flashToStage).toBe("function");
  });

  it("delegates to spriteRef.flashToStage", () => {
    const spriteRef = { flashToStage: vi.fn().mockReturnValue({ locH: 5, locV: 6 }) };
    const result = flashToStage(spriteRef, { locH: 1, locV: 2 });
    expect(spriteRef.flashToStage).toHaveBeenCalledWith({ locH: 1, locV: 2 });
    expect(result).toEqual({ locH: 5, locV: 6 });
  });

  it("passes a point value through", () => {
    const result = flashToStage(null, { locH: 100, locV: 200 });
    expect(result.locH).toBe(100);
    expect(result.locV).toBe(200);
  });

  it("matches the spec example shape (Flash point in channel 10)", () => {
    const spriteRef = { flashToStage: vi.fn() };
    flashToStage(spriteRef, { locH: 50, locV: 75 });
    expect(spriteRef.flashToStage).toHaveBeenCalledWith({ locH: 50, locV: 75 });
  });
});
