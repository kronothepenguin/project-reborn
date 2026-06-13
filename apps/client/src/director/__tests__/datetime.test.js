import { describe, it, expect } from "vitest";
import { date, time } from "../api.js";

describe("Director Date and Time Functions", () => {
  describe("date()", () => {
    it("returns current date string", () => {
      const result = date();
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("creates Date object with arguments", () => {
      const result = date(2024, 1, 15);
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
    });
  });

  describe("time()", () => {
    it("returns current time string", () => {
      const result = time();
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
