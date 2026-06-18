import { describe, it, expect } from "vitest";
import { numToChar } from "../numToChar.js";

describe("numToChar", () => {
  it("returns A for 65", () => {
    expect(numToChar(65)).toBe("A");
  });

  it("returns a for 97", () => {
    expect(numToChar(97)).toBe("a");
  });

  it("returns 0 for 48", () => {
    expect(numToChar(48)).toBe("0");
  });

  it("returns space for 32", () => {
    expect(numToChar(32)).toBe(" ");
  });

  it("is pure (no side effects)", () => {
    expect(numToChar(65)).toBe(numToChar(65));
  });
});
