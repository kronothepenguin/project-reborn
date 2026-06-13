import { describe, it, expect, beforeEach } from "vitest";
import { setCanvas } from "../runtime.js";

describe("Director Plugin - Canvas Management", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("setCanvas()", () => {
    it("accepts canvas element", () => {
      const canvas = document.createElement("canvas");
      expect(() => setCanvas(canvas)).not.toThrow();
    });

    it("accepts null", () => {
      expect(() => setCanvas(null)).not.toThrow();
    });

    it("stores canvas reference", () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      setCanvas(canvas);
      expect(canvas.width).toBe(640);
      expect(canvas.height).toBe(480);
    });
  });
});
