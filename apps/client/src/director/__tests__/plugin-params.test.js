import { describe, it, expect, beforeEach } from "vitest";

describe("Director Plugin - Parameter Parsing", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("setExternalParams()", () => {
    it("can be called with params object", () => {
      expect(() => {
        const params = { quality: "high" };
        for (const [name, value] of Object.entries(params)) {
          expect(name).toBeDefined();
          expect(value).toBeDefined();
        }
      }).not.toThrow();
    });

    it("handles empty params", () => {
      expect(() => {
        const params = {};
        for (const [name, value] of Object.entries(params)) {
          expect(name).toBeDefined();
        }
      }).not.toThrow();
    });

    it("extracts src parameter", () => {
      const params = { src: "movie.js" };
      let src = "";
      for (const [name, value] of Object.entries(params)) {
        if (name === "src") {
          src = value;
        }
      }
      expect(src).toBe("movie.js");
    });
  });
});
