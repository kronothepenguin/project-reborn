import { describe, it, expect } from "vitest";
import { soundBusy, playSound, queueSound } from "../api.js";

describe("Director Sound Functions", () => {
  describe("soundBusy()", () => {
    it("returns false for inactive channel", () => {
      expect(soundBusy(1)).toBe(false);
    });
  });

  describe("playSound()", () => {
    it("is callable", () => {
      expect(() => playSound(1, null)).not.toThrow();
    });
  });

  describe("queueSound()", () => {
    it("is callable", () => {
      expect(() => queueSound(1, null)).not.toThrow();
    });
  });
});
