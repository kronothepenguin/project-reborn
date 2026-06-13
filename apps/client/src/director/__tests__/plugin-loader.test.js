import { describe, it, expect } from "vitest";
import { finished, totalObjects, objectsLoaded } from "../core.js";

describe("Director Plugin - Loader Functions", () => {
  describe("finished()", () => {
    it("returns boolean", () => {
      expect(typeof finished()).toBe("boolean");
    });
  });

  describe("totalObjects()", () => {
    it("returns number", () => {
      expect(typeof totalObjects()).toBe("number");
    });
  });

  describe("objectsLoaded()", () => {
    it("returns number", () => {
      expect(typeof objectsLoaded()).toBe("number");
    });
  });
});
