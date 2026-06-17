import { describe, it, expect, beforeEach, vi } from "vitest";
import { PlayerRef, _player } from "../player-ref.js";

describe("PlayerRef", () => {
  describe("singleton", () => {
    it("_player is instance of PlayerRef", () => {
      expect(_player).toBeInstanceOf(PlayerRef);
    });

    it("_player is same reference on multiple imports", async () => {
      const { _player: player2 } = await import("../player-ref.js");
      expect(player2).toBe(_player);
    });
  });

  describe("runMode property (read-only)", () => {
    it('defaults to "Plugin"', () => {
      expect(_player.runMode).toBe("Plugin");
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _player.runMode = "Standalone";
      }).toThrow();
    });
  });

  describe("sound property (read-only)", () => {
    it("returns a proxy object", () => {
      expect(_player.sound).toBeDefined();
      expect(typeof _player.sound).toBe("object");
    });

    it("returns undefined for numeric indices", () => {
      expect(_player.sound[1]).toBeUndefined();
      expect(_player.sound[3]).toBeUndefined();
    });
  });

  describe("xtra property (indexed, read-only)", () => {
    it("returns a proxy object", () => {
      expect(_player.xtra).toBeDefined();
      expect(typeof _player.xtra).toBe("object");
    });

    it("returns undefined for unknown xtra names", () => {
      expect(_player.xtra["NonExistentXtra"]).toBeUndefined();
    });

    it("returns undefined for unknown numeric indices", () => {
      expect(_player.xtra[999]).toBeUndefined();
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _player.xtra["test"] = {};
      }).toThrow("xtra is read-only");
    });
  });

  describe("xtraList property (read-only)", () => {
    it("returns an array", () => {
      expect(Array.isArray(_player.xtraList)).toBe(true);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _player.xtraList = [];
      }).toThrow();
    });
  });

  describe("alertHook property (read-write)", () => {
    beforeEach(() => {
      _player.alertHook = null;
    });

    it("defaults to null", () => {
      const p = new PlayerRef();
      expect(p.alertHook).toBeNull();
    });

    it("sets and gets alertHook", () => {
      const handler = { onAlertHook: vi.fn() };
      _player.alertHook = handler;
      expect(_player.alertHook).toBe(handler);
    });
  });

  describe("debugPlaybackEnabled property (read-write)", () => {
    beforeEach(() => {
      _player.debugPlaybackEnabled = false;
    });

    it("defaults to false", () => {
      const p = new PlayerRef();
      expect(p.debugPlaybackEnabled).toBe(false);
    });

    it("sets debugPlaybackEnabled to true", () => {
      _player.debugPlaybackEnabled = true;
      expect(_player.debugPlaybackEnabled).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      _player.debugPlaybackEnabled = 1;
      expect(_player.debugPlaybackEnabled).toBe(true);
      _player.debugPlaybackEnabled = 0;
      expect(_player.debugPlaybackEnabled).toBe(false);
    });
  });

  describe("editShortcutsEnabled property (read-write)", () => {
    beforeEach(() => {
      _player.editShortcutsEnabled = false;
    });

    it("defaults to false", () => {
      const p = new PlayerRef();
      expect(p.editShortcutsEnabled).toBe(false);
    });

    it("sets editShortcutsEnabled to true", () => {
      _player.editShortcutsEnabled = true;
      expect(_player.editShortcutsEnabled).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      _player.editShortcutsEnabled = 1;
      expect(_player.editShortcutsEnabled).toBe(true);
      _player.editShortcutsEnabled = 0;
      expect(_player.editShortcutsEnabled).toBe(false);
    });
  });

  describe("exitLock property (read-write)", () => {
    beforeEach(() => {
      _player.exitLock = false;
    });

    it("defaults to false", () => {
      const p = new PlayerRef();
      expect(p.exitLock).toBe(false);
    });

    it("sets exitLock to true", () => {
      _player.exitLock = true;
      expect(_player.exitLock).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      _player.exitLock = 1;
      expect(_player.exitLock).toBe(true);
      _player.exitLock = 0;
      expect(_player.exitLock).toBe(false);
    });
  });

  describe("parameters property (read-write)", () => {
    beforeEach(() => {
      _player.parameters = {};
    });

    it("defaults to empty object", () => {
      const p = new PlayerRef();
      expect(p.parameters).toEqual({});
    });

    it("sets and gets parameters", () => {
      _player.parameters = { src: "movie.dcr", width: "640" };
      expect(_player.parameters).toEqual({ src: "movie.dcr", width: "640" });
    });
  });

  describe("getPref() method", () => {
    beforeEach(() => {
      globalThis.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
    });

    it("returns undefined for non-existent preference", () => {
      globalThis.localStorage.getItem.mockReturnValue(null);
      expect(_player.getPref("nonexistent")).toBeUndefined();
    });

    it("returns stored preference value", () => {
      globalThis.localStorage.getItem.mockReturnValue("myValue");
      expect(_player.getPref("myPref")).toBe("myValue");
    });

    it("calls localStorage with prefixed key", () => {
      globalThis.localStorage.getItem.mockReturnValue(null);
      _player.getPref("testKey");
      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith("director_pref_testKey");
    });
  });

  describe("setPref() method", () => {
    beforeEach(() => {
      globalThis.localStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
      };
    });

    it("stores preference in localStorage", () => {
      _player.setPref("myPref", "myValue");
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("director_pref_myPref", "myValue");
    });

    it("converts value to string", () => {
      _player.setPref("numPref", 42);
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("director_pref_numPref", "42");
    });
  });

  describe("externalParamValue() method", () => {
    beforeEach(() => {
      _player.parameters = {};
    });

    it("returns undefined for non-existent parameter", () => {
      expect(_player.externalParamValue("nonexistent")).toBeUndefined();
    });

    it("returns parameter from parameters object", () => {
      _player.parameters = { src: "movie.dcr" };
      expect(_player.externalParamValue("src")).toBe("movie.dcr");
    });

    it("returns parameter from URL search params", () => {
      globalThis.location = { search: "?src=test.dcr&width=640" };
      expect(_player.externalParamValue("src")).toBe("test.dcr");
      expect(_player.externalParamValue("width")).toBe("640");
    });

    it("prefers parameters object over URL params", () => {
      _player.parameters = { src: "from-params.dcr" };
      globalThis.location = { search: "?src=from-url.dcr" };
      expect(_player.externalParamValue("src")).toBe("from-params.dcr");
    });
  });

  describe("quit() method", () => {
    it("calls globalThis.close when available", () => {
      globalThis.close = vi.fn();
      _player.quit();
      expect(globalThis.close).toHaveBeenCalled();
    });
  });
});
