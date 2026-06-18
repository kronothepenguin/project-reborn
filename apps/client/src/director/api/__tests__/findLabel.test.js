import { describe, it, expect } from "vitest";
import { findLabel } from "../findLabel.js";

describe("findLabel", () => {
  it("is exported as a function", () => {
    expect(typeof findLabel).toBe("function");
  });

  it("takes one required parameter", () => {
    expect(findLabel.length).toBe(1);
  });

  it("returns 0 when no Flash label engine is available", () => {
    expect(findLabel("intro")).toBe(0);
  });

  it("returns 0 for unknown labels", () => {
    expect(findLabel("missing")).toBe(0);
  });
});
