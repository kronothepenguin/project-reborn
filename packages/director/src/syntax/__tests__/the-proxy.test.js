import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { the, _reset } from "../the-proxy.js";
import { _movie } from "../../core/movie-ref.js";
import { _mouse, MouseRef } from "../../core/mouse-ref.js";
import { _key, KeyRef } from "../../core/key-ref.js";
import { _player, PlayerRef } from "../../core/player-ref.js";
import { _sound, SoundRef } from "../../core/sound-ref.js";
import { CastLibraryRef } from "../../core/cast-library-ref.js";

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
    CastLibraryRef._reset();
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
      expect(() => {
        the.frame = 5;
      }).toThrow("Cannot set read-only property: the frame");
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

    it("throws when attempting to set mouseH", () => {
      expect(() => {
        the.mouseH = 50;
      }).toThrow("Cannot set read-only property: the mouseH");
    });

    it("throws when attempting to set mouseV", () => {
      expect(() => {
        the.mouseV = 50;
      }).toThrow("Cannot set read-only property: the mouseV");
    });
  });

  describe("the.stage (read-only, delegates to _movie.stage)", () => {
    it("returns stage dimensions proxy", () => {
      expect(the.stage).toBeDefined();
      expect(the.stage.left).toBe(0);
      expect(the.stage.top).toBe(0);
      expect(the.stage.right).toBe(640);
      expect(the.stage.bottom).toBe(480);
    });

    it("returns stage rect", () => {
      expect(the.stage.rect).toEqual({ left: 0, top: 0, right: 640, bottom: 480 });
    });

    it("throws when attempting to set", () => {
      expect(() => {
        the.stage = {};
      }).toThrow("Cannot set read-only property: the stage");
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

    it("throws when attempting to set", () => {
      expect(() => {
        the.keyCode = 13;
      }).toThrow("Cannot set read-only property: the keyCode");
    });
  });

  describe("the.time (computed)", () => {
    it("returns a non-empty string", () => {
      expect(typeof the.time).toBe("string");
      expect(the.time.length).toBeGreaterThan(0);
    });

    it("matches H:M:S format", () => {
      expect(the.time).toMatch(/^\d{1,2}:\d{2}:\d{2}$/);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        the.time = "00:00:00";
      }).toThrow("Cannot set read-only property: the time");
    });
  });

  describe("the.date (read-only, computed)", () => {
    it("returns a non-empty string", () => {
      expect(typeof the.date).toBe("string");
      expect(the.date.length).toBeGreaterThan(0);
    });

    it("contains a month name", () => {
      const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
      expect(months.some((m) => the.date.includes(m))).toBe(true);
    });
  });

  describe("the.systemMilliseconds (read-only, computed)", () => {
    it("returns a number close to Date.now()", () => {
      const before = Date.now();
      const value = the.systemMilliseconds;
      const after = Date.now();
      expect(typeof value).toBe("number");
      expect(value).toBeGreaterThanOrEqual(before);
      expect(value).toBeLessThanOrEqual(after);
    });
  });

  describe("the.pi (read-only, computed)", () => {
    it("returns Math.PI", () => {
      expect(the.pi).toBe(Math.PI);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        the.pi = 3;
      }).toThrow("Cannot set read-only property: the pi");
    });
  });

  describe("the constants", () => {
    it("the.true is true", () => {
      expect(the.true).toBe(true);
    });

    it("the.false is false", () => {
      expect(the.false).toBe(false);
    });

    it("the.void is undefined", () => {
      expect(the.void).toBeUndefined();
    });

    it("the.empty is empty string", () => {
      expect(the.empty).toBe("");
    });

    it("the.tab is tab character", () => {
      expect(the.tab).toBe("\t");
    });

    it("the.space is space character", () => {
      expect(the.space).toBe(" ");
    });

    it("the.maxInteger is Number.MAX_SAFE_INTEGER", () => {
      expect(the.maxInteger).toBe(Number.MAX_SAFE_INTEGER);
    });
  });

  describe("the system info (read-only, computed)", () => {
    it("the.machineType is Browser", () => {
      expect(the.machineType).toBe("Browser");
    });

    it("the.environment is Plugin", () => {
      expect(the.environment).toBe("Plugin");
    });

    it("the.productName is Director", () => {
      expect(the.productName).toBe("Director");
    });

    it("the.version is MX 2004", () => {
      expect(the.version).toBe("MX 2004");
    });

    it("the.platform is a string", () => {
      expect(typeof the.platform).toBe("string");
    });

    it("the.colorDepth is a number", () => {
      expect(typeof the.colorDepth).toBe("number");
    });
  });

  describe("the.runMode (read-only, delegates to _player)", () => {
    it("returns Plugin", () => {
      expect(the.runMode).toBe("Plugin");
    });
  });

  describe("the.mouse* (read-only)", () => {
    it("the.mouseDown is false by default", () => {
      expect(the.mouseDown).toBe(false);
    });

    it("the.mouseUp is true by default", () => {
      expect(the.mouseUp).toBe(true);
    });

    it("the.doubleClick is false by default", () => {
      expect(the.doubleClick).toBe(false);
    });

    it("the.clickOn is 0 by default", () => {
      expect(the.clickOn).toBe(0);
    });

    it("the.lastClick is 0 by default", () => {
      expect(the.lastClick).toBe(0);
    });

    it("the.lastEvent defaults to mouseUp", () => {
      expect(the.lastEvent).toBe("mouseUp");
    });

    it("updates when _mouse._setMouseDown called", () => {
      _mouse._setMouseDown(true);
      expect(the.mouseDown).toBe(true);
      expect(the.mouseUp).toBe(false);
    });
  });

  describe("the.key* (read-only)", () => {
    it("the.key is empty by default", () => {
      expect(the.key).toBe("");
    });

    it("the.keyPressed is false by default", () => {
      expect(the.keyPressed).toBe(false);
    });

    it("the.commandDown is false by default", () => {
      expect(the.commandDown).toBe(false);
    });

    it("the.controlDown is false by default", () => {
      expect(the.controlDown).toBe(false);
    });

    it("the.shiftDown is false by default", () => {
      expect(the.shiftDown).toBe(false);
    });

    it("the.optionDown is false by default", () => {
      expect(the.optionDown).toBe(false);
    });

    it("updates when _key._setKeyCode called", () => {
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

    it("the.wordDelimiter can be set", () => {
      the.wordDelimiter = ",";
      expect(the.wordDelimiter).toBe(",");
    });

    it("the.itemDelimiter can be set", () => {
      the.itemDelimiter = ":";
      expect(the.itemDelimiter).toBe(":");
    });

    it("the.lineDelimiter can be set", () => {
      the.lineDelimiter = "\r\n";
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

    it("the.pasteAllowed can be set", () => {
      the.pasteAllowed = false;
      expect(the.pasteAllowed).toBe(false);
    });

    it("the.printAsBitmap can be set", () => {
      the.printAsBitmap = false;
      expect(the.printAsBitmap).toBe(false);
    });

    it("the.previewAllowed can be set", () => {
      the.previewAllowed = false;
      expect(the.previewAllowed).toBe(false);
    });

    it("the.centerStage can be set", () => {
      the.centerStage = true;
      expect(the.centerStage).toBe(true);
    });

    it("the.updateMovieEnabled can be set", () => {
      the.updateMovieEnabled = false;
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

    it("the.field can be set", () => {
      the.field = "myField";
      expect(the.field).toBe("myField");
    });

    it("the.string can be set", () => {
      the.string = "hello";
      expect(the.string).toBe("hello");
    });

    it("the.selection can be set", () => {
      the.selection = "sel";
      expect(the.selection).toBe("sel");
    });

    it("the.selStart can be set", () => {
      the.selStart = 5;
      expect(the.selStart).toBe(5);
    });

    it("the.selEnd can be set", () => {
      the.selEnd = 10;
      expect(the.selEnd).toBe(10);
    });

    it("the.result can be set", () => {
      the.result = "ok";
      expect(the.result).toBe("ok");
    });

    it("the.pauseState can be set", () => {
      the.pauseState = true;
      expect(the.pauseState).toBe(true);
    });

    it("the.playing can be set", () => {
      the.playing = true;
      expect(the.playing).toBe(true);
    });

    it("the.beep can be set", () => {
      the.beep = 3;
      expect(the.beep).toBe(3);
    });
  });

  describe("the script handlers (writable, delegate to _mouse)", () => {
    it("the.keyDownScript defaults to empty", () => {
      expect(the.keyDownScript).toBe("");
    });

    it("the.keyUpScript defaults to empty", () => {
      expect(the.keyUpScript).toBe("");
    });

    it("the.mouseDownScript defaults to empty", () => {
      expect(the.mouseDownScript).toBe("");
    });

    it("the.mouseUpScript defaults to empty", () => {
      expect(the.mouseUpScript).toBe("");
    });

    it("the.mouseEnterScript defaults to empty", () => {
      expect(the.mouseEnterScript).toBe("");
    });

    it("the.mouseLeaveScript defaults to empty", () => {
      expect(the.mouseLeaveScript).toBe("");
    });

    it("the.mouseWithinScript defaults to empty", () => {
      expect(the.mouseWithinScript).toBe("");
    });

    it("the.keyDownScript can be set and read", () => {
      the.keyDownScript = "myHandler";
      expect(the.keyDownScript).toBe("myHandler");
    });

    it("the.mouseDownScript can be set and read", () => {
      the.mouseDownScript = "downHandler";
      expect(the.mouseDownScript).toBe("downHandler");
    });
  });

  describe("the read-only enforcement", () => {
    it("throws when setting the.frame", () => {
      expect(() => { the.frame = 5; }).toThrow("Cannot set read-only property: the frame");
    });

    it("throws when setting the.mouseH", () => {
      expect(() => { the.mouseH = 5; }).toThrow("Cannot set read-only property: the mouseH");
    });

    it("throws when setting the.mouseV", () => {
      expect(() => { the.mouseV = 5; }).toThrow("Cannot set read-only property: the mouseV");
    });

    it("throws when setting the.stage", () => {
      expect(() => { the.stage = {}; }).toThrow("Cannot set read-only property: the stage");
    });

    it("throws when setting the.keyCode", () => {
      expect(() => { the.keyCode = 13; }).toThrow("Cannot set read-only property: the keyCode");
    });

    it("throws when setting the.time", () => {
      expect(() => { the.time = "00:00:00"; }).toThrow("Cannot set read-only property: the time");
    });

    it("throws when setting the.date", () => {
      expect(() => { the.date = "today"; }).toThrow("Cannot set read-only property: the date");
    });

    it("throws when setting the.pi", () => {
      expect(() => { the.pi = 3; }).toThrow("Cannot set read-only property: the pi");
    });

    it("throws when setting the.runMode", () => {
      expect(() => { the.runMode = "Standalone"; }).toThrow("Cannot set read-only property: the runMode");
    });

    it("throws when setting the.movieName", () => {
      expect(() => { the.movieName = "x"; }).toThrow("Cannot set read-only property: the movieName");
    });

    it("throws when setting the.key", () => {
      expect(() => { the.key = "x"; }).toThrow("Cannot set read-only property: the key");
    });

    it("throws when setting the.commandDown", () => {
      expect(() => { the.commandDown = true; }).toThrow("Cannot set read-only property: the commandDown");
    });

    it("throws when setting the.mouseDown", () => {
      expect(() => { the.mouseDown = true; }).toThrow("Cannot set read-only property: the mouseDown");
    });

    it("throws when setting the.machineType", () => {
      expect(() => { the.machineType = "Server"; }).toThrow("Cannot set read-only property: the machineType");
    });

    it("throws when setting the.platform", () => {
      expect(() => { the.platform = "DOS"; }).toThrow("Cannot set read-only property: the platform");
    });

    it("throws when setting the.productName", () => {
      expect(() => { the.productName = "Other"; }).toThrow("Cannot set read-only property: the productName");
    });

    it("throws when setting the.version", () => {
      expect(() => { the.version = "1.0"; }).toThrow("Cannot set read-only property: the version");
    });

    it("throws when setting the.environment", () => {
      expect(() => { the.environment = "Test"; }).toThrow("Cannot set read-only property: the environment");
    });

    it("throws when setting the.colorDepth", () => {
      expect(() => { the.colorDepth = 8; }).toThrow("Cannot set read-only property: the colorDepth");
    });

    it("throws when setting the.true", () => {
      expect(() => { the.true = false; }).toThrow("Cannot set read-only property: the true");
    });

    it("throws when setting the.empty", () => {
      expect(() => { the.empty = "x"; }).toThrow("Cannot set read-only property: the empty");
    });

    it("throws when setting the.tab", () => {
      expect(() => { the.tab = "x"; }).toThrow("Cannot set read-only property: the tab");
    });

    it("throws when setting the.maxInteger", () => {
      expect(() => { the.maxInteger = 0; }).toThrow("Cannot set read-only property: the maxInteger");
    });
  });

  describe("the.net* properties (read-only)", () => {
    it("the.netBrowserName returns user agent", () => {
      expect(typeof the.netBrowserName).toBe("string");
    });

    it("the.netPresent returns boolean", () => {
      expect(typeof the.netPresent).toBe("boolean");
    });

    it("the.netTextResult returns string", () => {
      expect(typeof the.netTextResult).toBe("string");
    });

    it("the.netLastModDate returns string", () => {
      expect(typeof the.netLastModDate).toBe("string");
    });

    it("the.netMIME returns string", () => {
      expect(typeof the.netMIME).toBe("string");
    });

    it("the.netBrowserVendor returns string", () => {
      expect(typeof the.netBrowserVendor).toBe("string");
    });

    it("the.netBrowserVersion returns string", () => {
      expect(typeof the.netBrowserVersion).toBe("string");
    });
  });

  describe("the movie info (read-only)", () => {
    it("the.movieName returns movie name", () => {
      _movie._setName("Test");
      expect(the.movieName).toBe("Test");
    });

    it("the.moviePath returns movie path", () => {
      _movie._setPath("/path/");
      expect(the.moviePath).toBe("/path/");
    });

    it("the.copyrightInfo returns copyright", () => {
      _movie._setCopyrightInfo("(c)");
      expect(the.copyrightInfo).toBe("(c)");
    });

    it("the.lastChannel returns last channel", () => {
      _movie._setLastChannel(5);
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
    it("the.castLib is defined", () => {
      expect(the.castLib).toBeDefined();
    });

    it("the.numberOfCastLibs is a number", () => {
      expect(typeof the.numberOfCastLibs).toBe("number");
    });
  });

  describe("the sound (read-only)", () => {
    it("the.sound is _sound", () => {
      expect(the.sound).toBe(_sound);
    });

    it("the.soundEnabled defaults to true", () => {
      expect(the.soundEnabled).toBe(true);
    });

    it("the.soundEnabled can be set", () => {
      the.soundEnabled = false;
      expect(the.soundEnabled).toBe(false);
    });
  });

  describe("the.player* properties", () => {
    it("the.alertHook returns null by default", () => {
      expect(the.alertHook).toBeNull();
    });

    it("the.alertHook can be set", () => {
      const hook = () => {};
      the.alertHook = hook;
      expect(the.alertHook).toBe(hook);
    });

    it("the.debugPlaybackEnabled defaults to false", () => {
      expect(the.debugPlaybackEnabled).toBe(false);
    });

    it("the.debugPlaybackEnabled can be set", () => {
      the.debugPlaybackEnabled = true;
      expect(the.debugPlaybackEnabled).toBe(true);
    });

    it("the.editShortcutsEnabled defaults to false", () => {
      expect(the.editShortcutsEnabled).toBe(false);
    });

    it("the.editShortcutsEnabled can be set", () => {
      the.editShortcutsEnabled = true;
      expect(the.editShortcutsEnabled).toBe(true);
    });

    it("the.editShortCutsEnabled defaults to true", () => {
      expect(the.editShortCutsEnabled).toBe(true);
    });

    it("the.editShortCutsEnabled can be set", () => {
      the.editShortCutsEnabled = false;
      expect(the.editShortCutsEnabled).toBe(false);
    });

    it("the.cursor returns number", () => {
      expect(typeof the.cursor).toBe("number");
    });

    it("the.cursor can be set with number", () => {
      the.cursor = 5;
      expect(the.cursor).toBe(5);
    });
  });

  describe("the boolean flags (writable)", () => {
    it("the.multiSound defaults to true", () => {
      expect(the.multiSound).toBe(true);
    });

    it("the.multiSound can be set", () => {
      the.multiSound = false;
      expect(the.multiSound).toBe(false);
    });

    it("the.traceScript can be set", () => {
      the.traceScript = true;
      expect(the.traceScript).toBe(true);
    });

    it("the.showGlobals defaults to true", () => {
      expect(the.showGlobals).toBe(true);
    });

    it("the.showGlobals can be set", () => {
      the.showGlobals = false;
      expect(the.showGlobals).toBe(false);
    });

    it("the.fixStageSize defaults to true", () => {
      expect(the.fixStageSize).toBe(true);
    });

    it("the.fixStageSize can be set", () => {
      the.fixStageSize = false;
      expect(the.fixStageSize).toBe(false);
    });

    it("the.fixedLineHeight can be set", () => {
      the.fixedLineHeight = 12;
      expect(the.fixedLineHeight).toBe(12);
    });
  });

  describe("stage accessors (read-only)", () => {
    it("the.stageLeft is 0", () => {
      expect(the.stageLeft).toBe(0);
    });

    it("the.stageTop is 0", () => {
      expect(the.stageTop).toBe(0);
    });

    it("the.stageRight is 640", () => {
      expect(the.stageRight).toBe(640);
    });

    it("the.stageBottom is 480", () => {
      expect(the.stageBottom).toBe(480);
    });

    it("the.stageColor is 0", () => {
      expect(the.stageColor).toBe(0);
    });
  });

  describe("the time formats (read-only, computed)", () => {
    it("the.abbreviated returns abbreviated date", () => {
      expect(typeof the.abbreviated).toBe("string");
      expect(the.abbreviated.length).toBeGreaterThan(0);
    });

    it("the.abbreviatedTime returns time", () => {
      expect(typeof the.abbreviatedTime).toBe("string");
    });

    it("the.short returns short date", () => {
      expect(typeof the.short).toBe("string");
    });

    it("the.shortTime returns time", () => {
      expect(typeof the.shortTime).toBe("string");
    });

    it("the.long returns full date", () => {
      expect(typeof the.long).toBe("string");
    });
  });

  describe("the defaults (read-only)", () => {
    it("the.framesEnabled is true", () => {
      expect(the.framesEnabled).toBe(true);
    });

    it("the.stepFrame is 1", () => {
      expect(the.stepFrame).toBe(1);
    });

    it("the.safePlayer is true", () => {
      expect(the.safePlayer).toBe(true);
    });

    it("the.romanLingo is true", () => {
      expect(the.romanLingo).toBe(true);
    });

    it("the.scriptingXtrasAvailable is true", () => {
      expect(the.scriptingXtrasAvailable).toBe(true);
    });

    it("the.tellAppAvailable is false", () => {
      expect(the.tellAppAvailable).toBe(false);
    });

    it("the.xtras is defined", () => {
      expect(the.xtras).toBeDefined();
    });

    it("the.script is empty string", () => {
      expect(the.script).toBe("");
    });

    it("the.frameLabel is empty string", () => {
      expect(the.frameLabel).toBe("");
    });

    it("the.frameScript is empty string", () => {
      expect(the.frameScript).toBe("");
    });

    it("the.label is empty string", () => {
      expect(the.label).toBe("");
    });

    it("the.marker is empty string", () => {
      expect(the.marker).toBe("");
    });

    it("the.field is empty string by default", () => {
      expect(the.field).toBe("");
    });

    it("the.string is empty string by default", () => {
      expect(the.string).toBe("");
    });

    it("the.selection is empty string by default", () => {
      expect(the.selection).toBe("");
    });

    it("the.selStart is 0 by default", () => {
      expect(the.selStart).toBe(0);
    });

    it("the.selEnd is 0 by default", () => {
      expect(the.selEnd).toBe(0);
    });

    it("the.selChunk is empty string by default", () => {
      expect(the.selChunk).toBe("");
    });

    it("the.result is empty string by default", () => {
      expect(the.result).toBe("");
    });

    it("the.param is empty string by default", () => {
      expect(the.param).toBe("");
    });

    it("the.paramCount is 0", () => {
      expect(the.paramCount).toBe(0);
    });

    it("the.externalEventEnabled is false", () => {
      expect(the.externalEventEnabled).toBe(false);
    });

    it("the.windowList is array", () => {
      expect(Array.isArray(the.windowList)).toBe(true);
    });

    it("the.numberOfMembers is number", () => {
      expect(typeof the.numberOfMembers).toBe("number");
    });

    it("the.numberOfXtras is number", () => {
      expect(typeof the.numberOfXtras).toBe("number");
    });

    it("the.numberOfMenus is number", () => {
      expect(typeof the.numberOfMenus).toBe("number");
    });

    it("the.numberOfSounds is number", () => {
      expect(typeof the.numberOfSounds).toBe("number");
    });
  });
});
