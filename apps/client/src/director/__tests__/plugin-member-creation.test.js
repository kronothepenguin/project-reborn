import { describe, it, expect } from "vitest";
import { createBitmapMember, createFieldMember, createScriptMember, PARENT_SCRIPT } from "../runtime.js";

describe("Director Plugin - Member Creation", () => {
  describe("createBitmapMember()", () => {
    it("creates bitmap member", () => {
      const member = createBitmapMember("logo", "logo.png");
      expect(member).toBeDefined();
      expect(member.name).toBe("logo");
    });
  });

  describe("createFieldMember()", () => {
    it("creates field member", () => {
      const member = createFieldMember("text", "Hello");
      expect(member).toBeDefined();
      expect(member.name).toBe("text");
    });
  });

  describe("createScriptMember()", () => {
    it("creates script member", () => {
      const factory = () => ({});
      const member = createScriptMember("MyScript", PARENT_SCRIPT, factory);
      expect(member).toBeDefined();
      expect(member.name).toBe("MyScript");
    });

    it("stores factory", () => {
      const factory = () => ({ getValue: () => 42 });
      const member = createScriptMember("MyScript", PARENT_SCRIPT, factory);
      expect(member._raw).toBe(factory);
    });
  });
});
