import { describe, it, expect, vi } from "vitest";
import { hitTest } from "../hitTest.js";

describe("hitTest", () => {
  it("is exported as a function", () => {
    expect(typeof hitTest).toBe("function");
  });

  it("returns background by default", () => {
    expect(hitTest(null, { locH: 0, locV: 0 })).toBe("background");
  });

  it("delegates to spriteRef.hitTest", () => {
    const spriteRef = { hitTest: vi.fn().mockReturnValue("button") };
    const result = hitTest(spriteRef, { locH: 50, locV: 50 });
    expect(spriteRef.hitTest).toHaveBeenCalledWith({ locH: 50, locV: 50 });
    expect(result).toBe("button");
  });

  it("returns one of the documented values", () => {
    const valid = ["background", "normal", "button", "editText"];
    const result = hitTest(null, { locH: 0, locV: 0 });
    expect(valid).toContain(result);
  });

  it("matches the spec example shape (channel 5 button check)", () => {
    const sprite5 = { hitTest: vi.fn().mockReturnValue("button") };
    const result = hitTest(sprite5, { locH: 100, locV: 50 });
    expect(result).toBe("button");
  });
});
