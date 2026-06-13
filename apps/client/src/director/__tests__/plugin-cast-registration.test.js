import { describe, it, expect, beforeEach } from "vitest";
import { registerCast } from "../runtime.js";
import { _movie } from "../api.js";
import { createBitmapMember } from "../runtime.js";

describe("Director Plugin - Cast Registration", () => {
  beforeEach(() => {
    _movie._castCount = 0;
  });

  describe("registerCast()", () => {
    it("adds cast to movie", () => {
      const members = [createBitmapMember("logo", "logo.png")];
      registerCast("Internal", members);
      expect(_movie._castRegistry["Internal"]).toBeDefined();
    });

    it("assigns cast number", () => {
      const members = [createBitmapMember("logo", "logo.png")];
      registerCast("Test", members);
      expect(_movie._castCount).toBeGreaterThan(0);
    });

    it("stores members", () => {
      const member = createBitmapMember("logo", "logo.png");
      registerCast("Test2", [member]);
      const cast = _movie._castRegistry["Test2"];
      expect(cast).toBeDefined();
    });

    it("multiple casts can be registered", () => {
      registerCast("Cast1", []);
      registerCast("Cast2", []);
      expect(_movie._castRegistry["Cast1"]).toBeDefined();
      expect(_movie._castRegistry["Cast2"]).toBeDefined();
    });
  });
});
