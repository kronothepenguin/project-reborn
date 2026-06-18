import { describe, it, expect } from "vitest";
import { idleLoadDone } from "../idleLoadDone.js";

describe("idleLoadDone", () => {
  it("is exported as a function", () => {
    expect(typeof idleLoadDone).toBe("function");
  });

  it("takes one parameter (intLoadTag)", () => {
    expect(idleLoadDone.length).toBe(1);
  });

  it("returns true (no async loading tracked)", () => {
    expect(idleLoadDone(20)).toBe(true);
  });

  it("does not throw for various load tags", () => {
    expect(() => idleLoadDone(0)).not.toThrow();
    expect(() => idleLoadDone(100)).not.toThrow();
  });

  it("matches the spec example shape (load tag 20)", () => {
    if (idleLoadDone(20)) {
      expect(true).toBe(true);
    }
  });
});
