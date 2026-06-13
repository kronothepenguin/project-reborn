import { describe, it, expect } from "vitest";
import { updateStage, moveToFront, moveToBack } from "../api.js";

describe("Director Window and Stage Functions", () => {
  describe("updateStage()", () => {
    it("is callable", () => {
      expect(() => updateStage()).not.toThrow();
    });
  });

  describe("moveToFront()", () => {
    it("is callable", () => {
      expect(() => moveToFront(null)).not.toThrow();
    });
  });

  describe("moveToBack()", () => {
    it("is callable", () => {
      expect(() => moveToBack(null)).not.toThrow();
    });
  });
});
