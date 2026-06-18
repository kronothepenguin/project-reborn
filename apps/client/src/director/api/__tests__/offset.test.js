import { describe, it, expect } from "vitest";
import { offset } from "../offset.js";

describe("offset", () => {
  it("finds substring position with 1-based index", () => {
    expect(offset("ll", "hello")).toBe(3);
  });

  it("finds substring at the beginning", () => {
    expect(offset("he", "hello")).toBe(1);
  });

  it("finds substring from the Director reference example", () => {
    expect(offset("media", "Macromedia")).toBe(6);
  });

  it("returns 0 when substring is not found", () => {
    expect(offset("xyz", "hello")).toBe(0);
  });

  it("returns 0 for the Director not-found example", () => {
    expect(offset("Micro", "Macromedia")).toBe(0);
  });

  it("returns 1 for empty substring at start of search", () => {
    expect(offset("", "hello")).toBe(1);
  });

  it("is case-sensitive (matches JavaScript indexOf)", () => {
    expect(offset("HELLO", "hello")).toBe(0);
  });

  it("is pure (no side effects)", () => {
    expect(offset("ll", "hello")).toBe(offset("ll", "hello"));
  });
});
