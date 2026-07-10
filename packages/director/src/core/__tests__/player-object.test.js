import { describe, it, expect, beforeEach, vi } from "vitest";
import { PlayerObject, _player } from "../player-object.js";
import { WindowObject } from "../window-object.js";

describe("PlayerObject", () => {
  beforeEach(() => {
    WindowObject._reset();
    _player.parameters = {};
    _player.alertHook = null;
  });

  describe("singleton", () => {
    it("_player is instance of PlayerObject", () => {
      expect(_player).toBeInstanceOf(PlayerObject);
    });
  });

  describe("runMode (read-only)", () => {
    it('defaults to "Plugin"', () => {
      expect(_player.runMode).toBe("Plugin");
    });
    it("throws on set", () => {
      expect(() => { _player.runMode = "Standalone"; }).toThrow();
    });
  });

  describe("window / windowList proxies", () => {
    it("window returns null for unknown name", () => {
      expect(_player.window["Nonexistent"]).toBeNull();
    });
    it("window returns registered WindowObject", () => {
      const w = new WindowObject("Sun");
      expect(_player.window["Sun"]).toBe(w);
    });
    it("windowList exposes registered windows", () => {
      const a = new WindowObject("A");
      const b = new WindowObject("B");
      expect(_player.windowList[1]).toBe(a);
      expect(_player.windowList[2]).toBe(b);
      expect(_player.windowList.length).toBe(2);
    });
  });

  describe("sound / xtra / xtraList proxies", () => {
    it("sound[1] is undefined", () => {
      expect(_player.sound[1]).toBeUndefined();
    });
    it("xtra lookup returns undefined", () => {
      expect(_player.xtra["X"]).toBeUndefined();
    });
    it("xtra throws on set", () => {
      expect(() => { _player.xtra["t"] = {}; }).toThrow();
    });
    it("xtraList returns array", () => {
      expect(Array.isArray(_player.xtraList)).toBe(true);
    });
  });

  describe("alertHook/debugPlaybackEnabled/editShortcutsEnabled/exitLock/parameters", () => {
    it("alertHook set/get", () => {
      const h = () => {};
      _player.alertHook = h;
      expect(_player.alertHook).toBe(h);
    });
    it("debugPlaybackEnabled coerces to boolean", () => {
      _player.debugPlaybackEnabled = 1;
      expect(_player.debugPlaybackEnabled).toBe(true);
    });
    it("parameters roundtrip", () => {
      _player.parameters = { src: "x" };
      expect(_player.parameters.src).toBe("x");
    });
  });

  describe("getPref/setPref use localStorage", () => {
    beforeEach(() => {
      globalThis.localStorage = { getItem: vi.fn(), setItem: vi.fn() };
    });
    it("getPref returns undefined for missing", () => {
      globalThis.localStorage.getItem.mockReturnValue(null);
      expect(_player.getPref("nope")).toBeUndefined();
    });
    it("getPref prefixes key", () => {
      globalThis.localStorage.getItem.mockReturnValue(null);
      _player.getPref("k");
      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith("director_pref_k");
    });
    it("setPref stringifies value", () => {
      _player.setPref("n", 42);
      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith("director_pref_n", "42");
    });
  });

  describe("externalParamValue", () => {
    beforeEach(() => { _player.parameters = {}; });
    it("returns undefined for missing", () => {
      expect(_player.externalParamValue("nope")).toBeUndefined();
    });
    it("returns from parameters", () => {
      _player.parameters = { src: "x" };
      expect(_player.externalParamValue("src")).toBe("x");
    });
    it("falls back to URL search params", () => {
      globalThis.location = { search: "?src=test" };
      expect(_player.externalParamValue("src")).toBe("test");
    });
  });

  describe("quit / alert / cursor", () => {
    it("quit calls globalThis.close", () => {
      globalThis.close = vi.fn();
      _player.quit();
      expect(globalThis.close).toHaveBeenCalled();
    });
    it("alert calls alertHook", () => {
      const h = vi.fn();
      _player.alertHook = h;
      _player.alert("hi");
      expect(h).toHaveBeenCalledWith("hi");
    });
    it("alert slices long string to 255", () => {
      const h = vi.fn();
      _player.alertHook = h;
      _player.alert("a".repeat(300));
      expect(h.mock.calls[0][0].length).toBe(255);
    });
    it("cursor sets currentCursor by number", () => {
      _player.cursor(5);
      expect(_player.currentCursor).toBe(5);
    });
  });

  describe("Chapter-5 new methods", () => {
    it("halt/open/windowPresent return true", () => {
      expect(_player.halt()).toBe(true);
      expect(_player.open(0)).toBe(true);
      expect(_player.windowPresent(0)).toBe(true);
    });
    it("flushInputEvents is a no-op", () => {
      expect(() => _player.flushInputEvents()).not.toThrow();
    });
  });

  describe("Chapter-5 new props (writable)", () => {
    it("activeCastLib coerces to number", () => {
      _player.activeCastLib = "3";
      expect(_player.activeCastLib).toBe(3);
    });
    it("activeWindow accepts null/value", () => {
      _player.activeWindow = null;
      expect(_player.activeWindow).toBeNull();
    });
    it("applicationName/Path coerce to string", () => {
      _player.applicationName = 42; expect(_player.applicationName).toBe("42");
      _player.applicationPath = "x"; expect(_player.applicationPath).toBe("x");
    });
    it("currentSpriteNum coerces to number", () => {
      _player.currentSpriteNum = "5";
      expect(_player.currentSpriteNum).toBe(5);
    });
    it("digitalVideoTimeScale defaults to 1", () => {
      expect(_player.digitalVideoTimeScale).toBe(1);
    });
    it("disableImagingTransformation/emulateMultibuttonMouse coerce to boolean", () => {
      _player.disableImagingTransformation = 1; expect(_player.disableImagingTransformation).toBe(true);
      _player.emulateMultibuttonMouse = 0; expect(_player.emulateMultibuttonMouse).toBe(false);
    });
    it("externalParamCount counts parameters keys", () => {
      _player.parameters = { a: 1, b: 2 };
      expect(_player.externalParamCount).toBe(2);
    });
    it("frontWindow returns last in windowList", () => {
      const a = new WindowObject("A");
      const b = new WindowObject("B");
      expect(_player.frontWindow).toBe(b);
    });
    it("inlineImeEnabled coerce", () => {
      _player.inlineImeEnabled = 1;
      expect(_player.inlineImeEnabled).toBe(true);
    });
    it("mediaXtraList/scriptingXtraList/toolXtraList/transitionXtraList are read-only arrays", () => {
      expect(Array.isArray(_player.mediaXtraList)).toBe(true);
      expect(Array.isArray(_player.scriptingXtraList)).toBe(true);
      expect(Array.isArray(_player.toolXtraList)).toBe(true);
      expect(Array.isArray(_player.transitionXtraList)).toBe(true);
      expect(() => { _player.mediaXtraList = []; }).toThrow();
      expect(() => { _player.scriptingXtraList = []; }).toThrow();
      expect(() => { _player.toolXtraList = []; }).toThrow();
      expect(() => { _player.transitionXtraList = []; }).toThrow();
    });
    it("netPresent/netThrottleTicks", () => {
      _player.netPresent = true; expect(_player.netPresent).toBe(true);
      _player.netThrottleTicks = 5; expect(_player.netThrottleTicks).toBe(5);
    });
    it("organizationName/productName/productVersion/safePlayer/searchCurrentFolder/searchPathList/serialNumber/switchColorDepth/userName", () => {
      _player.organizationName = "org"; expect(_player.organizationName).toBe("org");
      _player.productName = "p"; expect(_player.productName).toBe("p");
      _player.productVersion = "v"; expect(_player.productVersion).toBe("v");
      _player.safePlayer = false; expect(_player.safePlayer).toBe(false);
      _player.searchCurrentFolder = "f"; expect(_player.searchCurrentFolder).toBe("f");
      _player.searchPathList = ["a"]; expect(_player.searchPathList).toEqual(["a"]);
      _player.serialNumber = "1"; expect(_player.serialNumber).toBe("1");
      _player.switchColorDepth = 16; expect(_player.switchColorDepth).toBe(16);
      _player.userName = "u"; expect(_player.userName).toBe("u");
    });
  });

  describe("input last* (read-only)", () => {
    it("lastClick/lastEvent/lastKey/lastRoll throw on set", () => {
      expect(() => { _player.lastClick = 1; }).toThrow();
      expect(() => { _player.lastEvent = "x"; }).toThrow();
      expect(() => { _player.lastKey = 1; }).toThrow();
      expect(() => { _player.lastRoll = 1; }).toThrow();
    });
  });
});
