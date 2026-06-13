import { describe, it, expect } from "vitest";
import { newFn, rawNew } from "../api.js";
import { ScriptRef, createScriptObject } from "../core.js";

describe("Director Instance Creation", () => {
  describe("newFn()", () => {
    it("creates instance from script reference", () => {
      const prototype = {
        getValue() { return 42; }
      };
      const factory = () => prototype;
      const member = { _raw: factory };
      const scriptRef = new ScriptRef(member);
      const instance = newFn(scriptRef);
      expect(instance).toBeDefined();
      expect(instance.getValue()).toBe(42);
    });
  });

  describe("rawNew()", () => {
    it("creates instance without initialization", () => {
      const prototype = {
        getValue() { return 99; }
      };
      const factory = () => prototype;
      const member = { _raw: factory };
      const scriptRef = new ScriptRef(member);
      const instance = rawNew(scriptRef);
      expect(instance).toBeDefined();
      expect(instance.getValue()).toBe(99);
    });
  });
});
