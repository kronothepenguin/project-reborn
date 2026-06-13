import { describe, it, expect } from "vitest";
import { script } from "../api.js";
import { ScriptRef, createScriptObject } from "../core.js";

describe("Director Plugin - Script References", () => {
  describe("script()", () => {
    it("returns stub for missing script", () => {
      const result = script("NonExistent");
      expect(result).toBeDefined();
      expect(typeof result.new).toBe("function");
      expect(typeof result.handler).toBe("function");
    });
  });

  describe("ScriptRef", () => {
    it("creates instance from factory", () => {
      const prototype = { getValue: () => 42 };
      const factory = () => prototype;
      const member = { _raw: factory };
      const scriptRef = new ScriptRef(member);
      const instance = scriptRef.new();
      expect(instance).toBeDefined();
      expect(instance.getValue()).toBe(42);
    });
  });

  describe("createScriptObject()", () => {
    it("creates proxy around prototype", () => {
      const prototype = { getValue: () => 99 };
      const obj = createScriptObject(prototype);
      expect(obj.getValue()).toBe(99);
    });
  });
});
