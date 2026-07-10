import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { the, _reset } from "../the-proxy.js";
import { _movie } from "../../core/movie-object.js";
import { _mouse, MouseObject } from "../../core/mouse-object.js";
import { _key, KeyObject } from "../../core/key-object.js";
import { _player, PlayerObject } from "../../core/player-object.js";
import { _sound, SoundObject } from "../../core/sound-object.js";
import { _system, SystemObject } from "../../core/system-object.js";
import { CastLibraryObject } from "../../core/cast-library-object.js";
import { WindowObject } from "../../core/window-object.js";

describe("the proxy", () => {
  beforeEach(() => {
    _reset();
    _movie._reset();
    _mouse._reset();
    _key._reset();
    _player.parameters = {};
    _player.debugPlaybackEnabled = false;
    _player.editShortcutsEnabled = false;
    _player.exitLock = false;
    _player.alertHook = null;
    _sound.soundEnabled = true;
    CastLibraryObject._reset();
    WindowObject._reset();
  });

  describe("importable", () => {
    it("is defined", () => {
      expect(the).toBeDefined();
      expect(typeof the).toBe("object");
    });

    it("is importable from syntax/index.js", async () => {
      const { the: theFromIndex } = await import("../index.js");
      expect(theFromIndex).toBeDefined();
    });
  });

  describe("the.frame (read-only, delegates to _movie)", () => {
    it("returns current frame number", () => {
      expect(the.frame).toBe(1);
    });
    it("returns updated frame after _movie.go()", () => {
      _movie.go(10);
      expect(the.frame).toBe(10);
    });
    it("throws when attempting to set", () => {
      expect(() => { the.frame = 5; }).toThrow("Cannot set read-only property: the frame");
    });
  });

  describe("the.mouseH and the.mouseV (read-only, delegates to _mouse)", () => {
    it("returns 0 by default", () => {
      expect(the.mouseH).toBe(0);
      expect(the.mouseV).toBe(0);
    });
    it("returns updated coordinates", () => {
      _mouse._setMouseH(100);
      _mouse._setMouseV(200);
      expect(the.mouseH).toBe(100);
      expect(the.mouseV).toBe(200);
    });
    it("throws when attempting to set mouseH/mouseV", () => {
      expect(() => { the.mouseH = 50; }).toThrow("Cannot set read-only property: the mouseH");
      expect(() => { the.mouseV = 50; }).toThrow("Cannot set read-only property: the mouseV");
    });
  });

  describe("the.stage (read-only, delegates to _movie.stage)", () => {
    it("returns stage dimensions", () => {
      expect(the.stage.left).toBe(0);
      expect(the.stage.right).toBe(640);
      expect(the.stage.bottom).toBe(480);
    });
    it("throws when set", () => {
      expect(() => { the.stage = {}; }).toThrow("Cannot set read-only property: the stage");
    });
  });

  describe("the.keyCode (read-only, delegates to _key)", () => {
    it("returns 0 by default", () => {
      expect(the.keyCode).toBe(0);
    });
    it("returns last key code", () => {
      _key._setKeyCode(65);
      expect(the.keyCode).toBe(65);
    });
    it("throws when set", () => {
      expect(() => { the.keyCode = 13; }).toThrow("Cannot set read-only property: the keyCode");
    });
  });

  describe("the.time (computed)", () => {
    it("matches H:M:S format", () => {
      expect(the.time).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });
    it("throws when set", () => {
      expect(() => { the.time = "00:00:00"; }).toThrow();
    });
  });

  describe("the.date (read-only, computed)", () => {
    it("contains a month name", () => {
      const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      expect(months.some((m) => the.date.includes(m))).toBe(true);
    });
  });

  describe("the.systemMilliseconds (delegates to _system)", () => {
    it("returns a number", () => {
      expect(typeof the.systemMilliseconds).toBe("number");
    });
  });

  describe("the.pi (read-only)", () => {
    it("returns Math.PI", () => {
      expect(the.pi).toBe(Math.PI);
    });
  });

  describe("the constants", () => {
    it("true/false/void/empty/tab/space/maxInteger", () => {
      expect(the.true).toBe(true);
      expect(the.false).toBe(false);
      expect(the.void).toBeUndefined();
      expect(the.empty).toBe("");
      expect(the.tab).toBe("\t");
      expect(the.space).toBe(" ");
      expect(the.maxInteger).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("the system info", () => {
    it("machineType/environment/productName/version", () => {
      expect(the.machineType).toBe("Browser");
      expect(the.environment).toBe("Plugin");
      expect(the.productName).toBe("Director");
      expect(the.version).toBe("MX 2004");
    });
    it("colorDepth is a number", () => {
      expect(typeof the.colorDepth).toBe("number");
    });
  });

  describe("the.runMode (read-only, delegates to _player)", () => {
    it("returns Plugin", () => {
      expect(the.runMode).toBe("Plugin");
    });
  });

  describe("the.mouse* (read-only)", () => {
    it("default states", () => {
      expect(the.mouseDown).toBe(false);
      expect(the.mouseUp).toBe(true);
      expect(the.doubleClick).toBe(false);
      expect(the.clickOn).toBe(0);
      expect(the.lastClick).toBe(0);
      expect(the.lastEvent).toBe("mouseUp");
    });
    it("updates when _mouse._setMouseDown called", () => {
      _mouse._setMouseDown(true);
      expect(the.mouseDown).toBe(true);
      expect(the.mouseUp).toBe(false);
    });
  });

  describe("the.key* (read-only)", () => {
    it("default states", () => {
      expect(the.key).toBe("");
      expect(the.keyPressed).toBe(false);
      expect(the.commandDown).toBe(false);
      expect(the.controlDown).toBe(false);
      expect(the.shiftDown).toBe(false);
      expect(the.optionDown).toBe(false);
    });
    it("updates when _key._setKeyCode/_setKey called", () => {
      _key._setKeyCode(13);
      _key._setKey("RETURN");
      expect(the.keyCode).toBe(13);
      expect(the.key).toBe("RETURN");
    });
  });

  describe("the writable properties", () => {
    it("the.wordDelimiter defaults to space", () => {
      expect(the.wordDelimiter).toBe(" ");
    });
    it("the.itemDelimiter defaults to comma", () => {
      expect(the.itemDelimiter).toBe(",");
    });
    it("the.lineDelimiter defaults to newline", () => {
      expect(the.lineDelimiter).toBe("\n");
    });
    it("wordDelimiter/itemDelimiter/lineDelimiter can be set", () => {
      the.wordDelimiter = ",";
      the.itemDelimiter = ":";
      the.lineDelimiter = "\r\n";
      expect(the.wordDelimiter).toBe(",");
      expect(the.itemDelimiter).toBe(":");
      expect(the.lineDelimiter).toBe("\r\n");
    });
    it("the.floatPrecision can be set", () => {
      the.floatPrecision = 8;
      expect(the.floatPrecision).toBe(8);
    });
    it("the.trace can be set", () => {
      the.trace = true;
      expect(the.trace).toBe(true);
    });
    it("the.exitLock can be set", () => {
      the.exitLock = true;
      expect(the.exitLock).toBe(true);
    });
    it("the.beepOn can be set", () => {
      the.beepOn = false;
      expect(the.beepOn).toBe(false);
    });
    it("the.checkBoxAccess can be set", () => {
      the.checkBoxAccess = false;
      expect(the.checkBoxAccess).toBe(false);
    });
    it("the.pasteAllowed/printAsBitmap/previewAllowed can be set", () => {
      the.pasteAllowed = false;
      the.printAsBitmap = false;
      the.previewAllowed = false;
      expect(the.pasteAllowed).toBe(false);
      expect(the.printAsBitmap).toBe(false);
      expect(the.previewAllowed).toBe(false);
    });
    it("the.centerStage/updateMovieEnabled can be set", () => {
      the.centerStage = true;
      the.updateMovieEnabled = false;
      expect(the.centerStage).toBe(true);
      expect(the.updateMovieEnabled).toBe(false);
    });
    it("the.soundLevel can be set", () => {
      the.soundLevel = 50;
      expect(the.soundLevel).toBe(50);
    });
    it("the.searchCurrentPath can be set", () => {
      the.searchCurrentPath = "/movies";
      expect(the.searchCurrentPath).toBe("/movies");
    });
    it("the.searchPath can be set to array", () => {
      the.searchPath = ["/a", "/b"];
      expect(the.searchPath).toEqual(["/a", "/b"]);
    });
    it("the.searchPath coerces non-array to empty array", () => {
      the.searchPath = "not-an-array";
      expect(the.searchPath).toEqual([]);
    });
    it("the.preLoadRAM can be set", () => {
      the.preLoadRAM = 1024;
      expect(the.preLoadRAM).toBe(1024);
    });
    it("the.timer can be set", () => {
      the.timer = 100;
      expect(the.timer).toBe(100);
    });
    it("the.field/string/selection/selStart/selEnd can be set", () => {
      the.field = "myField";
      the.string = "hello";
      the.selection = "sel";
      the.selStart = 5;
      the.selEnd = 10;
      expect(the.field).toBe("myField");
      expect(the.string).toBe("hello");
      expect(the.selection).toBe("sel");
      expect(the.selStart).toBe(5);
      expect(the.selEnd).toBe(10);
    });
    it("the.result can be set", () => {
      the.result = "ok";
      expect(the.result).toBe("ok");
    });
    it("the.pauseState/playing can be set", () => {
      the.pauseState = true;
      the.playing = true;
      expect(the.pauseState).toBe(true);
      expect(the.playing).toBe(true);
    });
    it("the.beep can be set", () => {
      the.beep = 3;
      expect(the.beep).toBe(3);
    });
  });

  describe("the script handlers (writable, delegate to _mouse)", () => {
    it("defaults to empty", () => {
      expect(the.keyDownScript).toBe("");
      expect(the.keyUpScript).toBe("");
      expect(the.mouseDownScript).toBe("");
      expect(the.mouseUpScript).toBe("");
      expect(the.mouseEnterScript).toBe("");
      expect(the.mouseLeaveScript).toBe("");
      expect(the.mouseWithinScript).toBe("");
    });
    it("can be set and read", () => {
      the.keyDownScript = "k";
      the.mouseDownScript = "d";
      expect(the.keyDownScript).toBe("k");
      expect(the.mouseDownScript).toBe("d");
    });
  });

  describe("the read-only enforcement", () => {
    it("throws on setting read-only props", () => {
      const readOnly = ["frame", "mouseH", "mouseV", "stage", "keyCode", "time", "date",
        "pi", "runMode", "movieName", "key", "commandDown", "mouseDown", "machineType",
        "platform", "productName", "version", "environment", "colorDepth", "true", "empty",
        "tab", "maxInteger"];
      for (const p of readOnly) {
        expect(() => { the[p] = "x"; }).toThrow();
      }
    });
  });

  describe("the.net* properties (read-only)", () => {
    it("returns expected types", () => {
      expect(typeof the.netBrowserName).toBe("string");
      expect(typeof the.netPresent).toBe("boolean");
      expect(typeof the.netTextResult).toBe("string");
      expect(typeof the.netLastModDate).toBe("string");
      expect(typeof the.netMIME).toBe("string");
      expect(typeof the.netBrowserVendor).toBe("string");
      expect(typeof the.netBrowserVersion).toBe("string");
    });
  });

  describe("the movie info (read-only)", () => {
    it("returns set values", () => {
      _movie._setName("Test");
      _movie._setPath("/path/");
      _movie._setCopyrightInfo("(c)");
      _movie._setLastChannel(5);
      expect(the.movieName).toBe("Test");
      expect(the.moviePath).toBe("/path/");
      expect(the.copyrightInfo).toBe("(c)");
      expect(the.lastChannel).toBe(5);
    });
    it("the.frameRate returns frameTempo", () => {
      _movie.frameTempo = 30;
      expect(the.frameRate).toBe(30);
    });
    it("the.movie is _movie", () => {
      expect(the.movie).toBe(_movie);
    });
  });

  describe("the castLib access (read-only)", () => {
    it("the.castLib is defined and numberOfCastLibs is a number", () => {
      expect(the.castLib).toBeDefined();
      expect(typeof the.numberOfCastLibs).toBe("number");
    });
  });

  describe("the sound (read-only)", () => {
    it("the.sound is _sound and soundEnabled default true", () => {
      expect(the.sound).toBe(_sound);
      expect(the.soundEnabled).toBe(true);
    });
    it("the.soundEnabled can be set", () => {
      the.soundEnabled = false;
      expect(the.soundEnabled).toBe(false);
    });
  });

  describe("the.player* properties", () => {
    it("the.alertHook defaults to null and can be set", () => {
      expect(the.alertHook).toBeNull();
      const hook = () => {};
      the.alertHook = hook;
      expect(the.alertHook).toBe(hook);
    });
    it("the.debugPlaybackEnabled defaults false and can be set", () => {
      expect(the.debugPlaybackEnabled).toBe(false);
      the.debugPlaybackEnabled = true;
      expect(the.debugPlaybackEnabled).toBe(true);
    });
    it("the.editShortcutsEnabled defaults false and can be set", () => {
      expect(the.editShortcutsEnabled).toBe(false);
      the.editShortcutsEnabled = true;
      expect(the.editShortcutsEnabled).toBe(true);
    });
    it("the.editShortCutsEnabled defaults true and can be set", () => {
      expect(the.editShortCutsEnabled).toBe(true);
      the.editShortCutsEnabled = false;
      expect(the.editShortCutsEnabled).toBe(false);
    });
    it("the.cursor returns number and can be set", () => {
      expect(typeof the.cursor).toBe("number");
      the.cursor = 5;
      expect(the.cursor).toBe(5);
    });
  });

  describe("the boolean flags (writable)", () => {
    it("the.multiSound defaults true, can be set", () => {
      expect(the.multiSound).toBe(true);
      the.multiSound = false;
      expect(the.multiSound).toBe(false);
    });
    it("the.traceScript can be set", () => {
      the.traceScript = true;
      expect(the.traceScript).toBe(true);
    });
    it("the.showGlobals defaults true, can be set", () => {
      expect(the.showGlobals).toBe(true);
      the.showGlobals = false;
      expect(the.showGlobals).toBe(false);
    });
    it("the.fixStageSize defaults true, can be set", () => {
      expect(the.fixStageSize).toBe(true);
      the.fixStageSize = false;
      expect(the.fixStageSize).toBe(false);
    });
    it("the.fixedLineHeight can be set", () => {
      the.fixedLineHeight = 12;
      expect(the.fixedLineHeight).toBe(12);
    });
  });

  describe("stage accessors (read-only)", () => {
    it("the.stageLeft/stageTop/stageRight/stageBottom match stage proxy", () => {
      expect(the.stageLeft).toBe(0);
      expect(the.stageTop).toBe(0);
      expect(the.stageRight).toBe(640);
      expect(the.stageBottom).toBe(480);
      expect(the.stageColor).toBe(0);
    });
  });

  describe("the time formats (read-only, computed)", () => {
    it("returns non-empty strings", () => {
      expect(typeof the.abbreviated).toBe("string");
      expect(typeof the.abbreviatedTime).toBe("string");
      expect(typeof the.short).toBe("string");
      expect(typeof the.shortTime).toBe("string");
      expect(typeof the.long).toBe("string");
    });
  });

  describe("the defaults (read-only)", () => {
    it("framesEnabled/stepFrame/safePlayer/romanLingo/scriptingXtrasAvailable/tellAppAvailable", () => {
      expect(the.framesEnabled).toBe(true);
      expect(the.stepFrame).toBe(1);
      expect(the.safePlayer).toBe(true);
      expect(the.romanLingo).toBe(true);
      expect(the.scriptingXtrasAvailable).toBe(true);
      expect(the.tellAppAvailable).toBe(false);
    });
    it("xtras is defined and script is empty", () => {
      expect(the.xtras).toBeDefined();
      expect(the.script).toBe("");
    });
    it("frame-level properties default to empty/0", () => {
      expect(the.frameLabel).toBe("");
      expect(the.frameScript).toBe("");
      expect(the.label).toBe("");
      expect(the.marker).toBe("");
    });
    it("selection/field/string/result/param defaults to empty", () => {
      expect(the.field).toBe("");
      expect(the.string).toBe("");
      expect(the.selection).toBe("");
      expect(the.selStart).toBe(0);
      expect(the.selEnd).toBe(0);
      expect(the.selChunk).toBe("");
      expect(the.result).toBe("");
      expect(the.param).toBe("");
    });
    it("paramCount/externalEventEnabled/windowList/numbers defaults", () => {
      expect(the.paramCount).toBe(0);
      expect(the.externalEventEnabled).toBe(false);
      expect(Array.isArray(the.windowList)).toBe(true);
      expect(typeof the.numberOfMembers).toBe("number");
      expect(typeof the.numberOfXtras).toBe("number");
      expect(typeof the.numberOfMenus).toBe("number");
      expect(typeof the.numberOfSounds).toBe("number");
    });
  });

  describe("the mouseLoc / rightMouseDown / rightMouseUp / mouseMember (new in Chapter-5)", () => {
    it("mouseLoc returns {h, v} object", () => {
      expect(the.mouseLoc).toEqual({ h: 0, v: 0 });
    });
    it("rightMouseDown/rightMouseUp default false/true", () => {
      expect(the.rightMouseDown).toBe(false);
      expect(the.rightMouseUp).toBe(true);
    });
    it("mouseMember default 0", () => {
      expect(the.mouseMember).toBe(0);
    });
  });

  describe("the.window proxy", () => {
    it("returns null for unknown name", () => {
      expect(the.window["None"]).toBeNull();
    });
    it("returns the registered WindowObject", () => {
      const w = new WindowObject("Sun");
      expect(the.window["Sun"]).toBe(w);
    });
  });
});
