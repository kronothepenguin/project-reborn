import { describe, it, expect } from "vitest";
import { PlayerObject } from "../player.js";

describe("PlayerObject (canon)", () => {
  describe("constructor defaults", () => {
    const p = new PlayerObject();

    it("runMode === 'Plugin'", () => {
      expect(p.runMode).toBe("Plugin");
    });

    it("productName === 'Director'", () => {
      expect(p.productName).toBe("Director");
    });

    it("productVersion === 'MX 2004'", () => {
      expect(p.productVersion).toBe("MX 2004");
    });

    it("safePlayer === true", () => {
      expect(p.safePlayer).toBe(true);
    });

    it("activeCastLib === 1", () => {
      expect(p.activeCastLib).toBe(1);
    });

    it("activeWindow === null", () => {
      expect(p.activeWindow).toBeNull();
    });

    it("currentCursor === 0", () => {
      expect(p.currentCursor).toBe(0);
    });

    it("currentSpriteNum === 0", () => {
      expect(p.currentSpriteNum).toBe(0);
    });

    it("digitalVideoTimeScale === 1", () => {
      expect(p.digitalVideoTimeScale).toBe(1);
    });

    it("frontWindow === null", () => {
      expect(p.frontWindow).toBeNull();
    });

    it("externalParamCount === 0", () => {
      expect(p.externalParamCount).toBe(0);
    });

    it("lastClick === 0", () => {
      expect(p.lastClick).toBe(0);
    });

    it("lastEvent === ''", () => {
      expect(p.lastEvent).toBe("");
    });

    it("lastKey === 0", () => {
      expect(p.lastKey).toBe(0);
    });

    it("lastRoll === 0", () => {
      expect(p.lastRoll).toBe(0);
    });

    it("netPresent === false", () => {
      expect(p.netPresent).toBe(false);
    });

    it("netThrottleTicks === 0", () => {
      expect(p.netThrottleTicks).toBe(0);
    });

    it("switchColorDepth === 0", () => {
      expect(p.switchColorDepth).toBe(0);
    });

    it("editShortcutsEnabled === false", () => {
      expect(p.editShortcutsEnabled).toBe(false);
    });

    it("exitLock === false", () => {
      expect(p.exitLock).toBe(false);
    });

    it("debugPlaybackEnabled === false", () => {
      expect(p.debugPlaybackEnabled).toBe(false);
    });

    it("disableImagingTransformation === false", () => {
      expect(p.disableImagingTransformation).toBe(false);
    });

    it("emulateMultibuttonMouse === false", () => {
      expect(p.emulateMultibuttonMouse).toBe(false);
    });

    it("inlineImeEnabled === false", () => {
      expect(p.inlineImeEnabled).toBe(false);
    });

    it("parameters defaults to empty object", () => {
      expect(p.parameters).toEqual({});
    });

    it("searchPathList defaults to empty array", () => {
      expect(p.searchPathList).toEqual([]);
    });

    it("mediaXtraList defaults to empty array", () => {
      expect(p.mediaXtraList).toEqual([]);
    });

    it("scriptingXtraList defaults to empty array", () => {
      expect(p.scriptingXtraList).toEqual([]);
    });

    it("toolXtraList defaults to empty array", () => {
      expect(p.toolXtraList).toEqual([]);
    });

    it("transitionXtraList defaults to empty array", () => {
      expect(p.transitionXtraList).toEqual([]);
    });

    it("windowList defaults to empty array", () => {
      expect(p.windowList).toEqual([]);
    });

    it("xtraList defaults to empty array", () => {
      expect(p.xtraList).toEqual([]);
    });

    it("window === null", () => {
      expect(p.window).toBeNull();
    });

    it("xtra === null", () => {
      expect(p.xtra).toBeNull();
    });

    it("sound === null", () => {
      expect(p.sound).toBeNull();
    });

    it("alertHook === null", () => {
      expect(p.alertHook).toBeNull();
    });

    it("applicationName === ''", () => {
      expect(p.applicationName).toBe("");
    });

    it("applicationPath === ''", () => {
      expect(p.applicationPath).toBe("");
    });

    it("organizationName === ''", () => {
      expect(p.organizationName).toBe("");
    });

    it("userName === ''", () => {
      expect(p.userName).toBe("");
    });

    it("serialNumber === ''", () => {
      expect(p.serialNumber).toBe("");
    });

    it("searchCurrentFolder === true", () => {
      expect(p.searchCurrentFolder).toBe(true);
    });
  });

  describe("plain assignment (no throws)", () => {
    it("organizationName = 'Acme'", () => {
      const p = new PlayerObject();
      p.organizationName = "Acme";
      expect(p.organizationName).toBe("Acme");
    });

    it("parameters replaced by direct assignment", () => {
      const p = new PlayerObject();
      p.parameters = { src: "x" };
      expect(p.parameters).toEqual({ src: "x" });
    });

    it("lastClick is writable (no throw)", () => {
      const p = new PlayerObject();
      p.lastClick = 5;
      expect(p.lastClick).toBe(5);
    });

    it("mediaXtraList is writable (no throw)", () => {
      const p = new PlayerObject();
      p.mediaXtraList = ["a"];
      expect(p.mediaXtraList).toEqual(["a"]);
    });

    it("safePlayer is writable", () => {
      const p = new PlayerObject();
      p.safePlayer = false;
      expect(p.safePlayer).toBe(false);
    });

    it("runMode is writable (no read-only throw)", () => {
      const p = new PlayerObject();
      p.runMode = "Author";
      expect(p.runMode).toBe("Author");
    });
  });

  describe("methods return documented defaults", () => {
    it("windowPresent('nope') returns false", () => {
      expect(new PlayerObject().windowPresent("nope")).toBe(false);
    });

    it("getPref('x') returns undefined", () => {
      expect(new PlayerObject().getPref("x")).toBeUndefined();
    });

    it("externalParamName(1) returns null", () => {
      expect(new PlayerObject().externalParamName(1)).toBeNull();
    });

    it("externalParamValue('x') returns undefined", () => {
      expect(new PlayerObject().externalParamValue("x")).toBeUndefined();
    });

    it("alert is a no-op returning undefined", () => {
      expect(new PlayerObject().alert("hi")).toBeUndefined();
    });

    it("appMinimize is a no-op returning undefined", () => {
      expect(new PlayerObject().appMinimize()).toBeUndefined();
    });

    it("halt is a no-op returning undefined", () => {
      expect(new PlayerObject().halt()).toBeUndefined();
    });

    it("open is a no-op returning undefined", () => {
      expect(new PlayerObject().open("doc", "app")).toBeUndefined();
    });

    it("quit is a no-op returning undefined", () => {
      expect(new PlayerObject().quit()).toBeUndefined();
    });

    it("flushInputEvents is a no-op returning undefined", () => {
      expect(new PlayerObject().flushInputEvents()).toBeUndefined();
    });

    it("setPref is a no-op returning undefined", () => {
      expect(new PlayerObject().setPref("k", "v")).toBeUndefined();
    });

    it("cursor is a no-op returning undefined", () => {
      expect(new PlayerObject().cursor(5)).toBeUndefined();
    });
  });

  describe("no statics (FR-005)", () => {
    it("PlayerObject.window is undefined (static removed)", () => {
      expect(PlayerObject.window).toBeUndefined();
    });

    it("PlayerObject.windowList is undefined (static removed)", () => {
      expect(PlayerObject.windowList).toBeUndefined();
    });

    it("PlayerObject._reset is undefined", () => {
      expect(PlayerObject._reset).toBeUndefined();
    });
  });

  describe("surface check", () => {
    const methods = ["alert", "appMinimize", "cursor", "externalParamName",
      "externalParamValue", "flushInputEvents", "getPref", "halt", "open",
      "quit", "setPref", "windowPresent"];

    it("prototype has all documented methods", () => {
      for (const name of methods) {
        expect(typeof PlayerObject.prototype[name]).toBe("function");
      }
    });

    it("instance has documented own fields", () => {
      const p = new PlayerObject();
      for (const f of [
        "activeCastLib", "activeWindow", "alertHook", "applicationName",
        "applicationPath", "currentSpriteNum", "currentCursor",
        "debugPlaybackEnabled", "digitalVideoTimeScale",
        "disableImagingTransformation", "emulateMultibuttonMouse",
        "editShortcutsEnabled", "exitLock", "externalParamCount",
        "frontWindow", "inlineImeEnabled", "lastClick", "lastEvent",
        "lastKey", "lastRoll", "mediaXtraList", "netPresent",
        "netThrottleTicks", "organizationName", "parameters",
        "productName", "productVersion", "runMode", "safePlayer",
        "scriptingXtraList", "searchCurrentFolder", "searchPathList",
        "serialNumber", "sound", "switchColorDepth", "toolXtraList",
        "transitionXtraList", "userName", "window", "windowList", "xtra",
        "xtraList",
      ]) {
        expect(Object.prototype.hasOwnProperty.call(p, f)).toBe(true);
      }
    });
  });
});