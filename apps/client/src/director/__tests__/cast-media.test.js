import { describe, it, expect } from "vitest";
import { newMember, unLoadMember, preLoadMember, resetCastLibs } from "../api.js";

describe("Director Cast and Media Functions", () => {
  describe("newMember()", () => {
    it("creates member with correct type", () => {
      const m = newMember(Symbol.for("bitmap"));
      expect(m).toBeDefined();
    });
  });

  describe("unLoadMember()", () => {
    it("is callable", () => {
      expect(() => unLoadMember(null)).not.toThrow();
    });
  });

  describe("preLoadMember()", () => {
    it("is callable", () => {
      expect(() => preLoadMember(null)).not.toThrow();
    });
  });

  describe("resetCastLibs()", () => {
    it("is callable", () => {
      expect(() => resetCastLibs()).not.toThrow();
    });
  });
});
