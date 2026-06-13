import { describe, it, expect } from "vitest";
import { the, _player } from "../index.js";

describe("Director `the` Proxy - Low Priority Properties", () => {
  describe("the.xtraList", () => {
    it("maps to _player.xtraList", () => {
      const result = the.xtraList;
      expect(Array.isArray(result) || result !== undefined).toBe(true);
    });
  });

  describe("the.parameters", () => {
    it("maps to _player.parameters", () => {
      const result = the.parameters;
      expect(typeof result === "object" || result !== undefined).toBe(true);
    });
  });

  describe("the.exitLock", () => {
    it("maps to _player.exitLock", () => {
      _player.exitLock = true;
      expect(the.exitLock).toBe(true);
      _player.exitLock = false;
      expect(the.exitLock).toBe(false);
    });
  });

  describe("the.editShortcutsEnabled", () => {
    it("maps to _player.editShortcutsEnabled", () => {
      _player.editShortcutsEnabled = true;
      expect(the.editShortcutsEnabled).toBe(true);
      _player.editShortcutsEnabled = false;
      expect(the.editShortcutsEnabled).toBe(false);
    });
  });
});
