import { describe, it, expect, beforeEach } from "vitest";
import { MovieObject } from "../movie.js";
import { _movie } from "../../singletons.js";
import { CastLibraryObject } from "../cast-library.js";
import { WindowObject } from "../window.js";

describe("MovieObject", () => {
  beforeEach(() => {
    _movie._reset();
    CastLibraryObject._reset();
    WindowObject._reset();
  });

  describe("singleton", () => {
    it("_movie is instance of MovieObject", () => {
      expect(_movie).toBeInstanceOf(MovieObject);
    });
  });

  describe("frame (read-only)", () => {
    it("defaults to 1", () => expect(_movie.frame).toBe(1));
    it("throws when set", () => expect(() => { _movie.frame = 5; }).toThrow());
    it("updates via go()", () => {
      _movie.go(10);
      expect(_movie.frame).toBe(10);
    });
  });

  describe("frameTempo (read-write)", () => {
    it("coerces to number", () => {
      _movie.frameTempo = "15";
      expect(_movie.frameTempo).toBe(15);
    });
  });

  describe("name/path/moviePath/copyrightInfo (read-only)", () => {
    it("throws when set directly", () => {
      expect(() => { _movie.name = "x"; }).toThrow();
      expect(() => { _movie.path = "x"; }).toThrow();
    });
    it("returns set values via _set*", () => {
      _movie._setName("Test");
      _movie._setPath("/p/");
      _movie._setMoviePath("/m.dcr");
      _movie._setCopyrightInfo("(c)");
      expect(_movie.name).toBe("Test");
      expect(_movie.path).toBe("/p/");
      expect(_movie.moviePath).toBe("/m.dcr");
      expect(_movie.copyrightInfo).toBe("(c)");
    });
  });

  describe("castLib / sprite / member / stage proxies", () => {
    it("castLib proxies to CastLibraryObject", () => {
      const c = new CastLibraryObject({ number: 1, name: "Internal" });
      CastLibraryObject._register(c);
      expect(_movie.castLib[1]).toBe(c);
      expect(_movie.castLib["Internal"]).toBe(c);
      expect(() => { _movie.castLib[1] = {}; }).toThrow();
    });

    it("sprite registry add and lookup", () => {
      const s = { name: "btn", channel: 1 };
      _movie._addSprite(s);
      expect(_movie.sprite[1]).toBe(s);
      expect(_movie.sprite["btn"]).toBe(s);
      expect(() => { _movie.sprite[1] = {}; }).toThrow();
    });

    it("member registry add and lookup", () => {
      const m = { name: "x", number: 1 };
      _movie._addMember(m);
      expect(_movie.member[1]).toBe(m);
      expect(_movie.member["x"]).toBe(m);
    });

    it("stage returns 640x480 by default", () => {
      expect(_movie.stage.left).toBe(0);
      expect(_movie.stage.right).toBe(640);
      expect(_movie.stage.bottom).toBe(480);
    });
  });

  describe("navigation methods", () => {
    it("go() sets frame", () => {
      _movie.go(5);
      expect(_movie.frame).toBe(5);
    });
    it("goNext/goPrevious/goLoop are no-ops", () => {
      expect(() => { _movie.goNext(); _movie.goPrevious(); _movie.goLoop(); }).not.toThrow();
    });
  });

  describe("puppet methods", () => {
    it("puppetSprite tracks state", () => {
      _movie.puppetSprite(1, true);
      _movie.puppetSprite(1, false);
    });
    it("puppetTempo sets frameTempo", () => {
      _movie.puppetTempo(30);
      expect(_movie.frameTempo).toBe(30);
    });
    it("puppetPalette/puppetTransition return true", () => {
      expect(_movie.puppetPalette(0)).toBe(true);
      expect(_movie.puppetTransition()).toBe(true);
    });
  });

  describe("recording session", () => {
    it("beginRecording advances frame", () => {
      const f = _movie.frame;
      _movie.beginRecording();
      expect(_movie.frame).toBe(f + 1);
    });
    it("endRecording completes session", () => {
      _movie.beginRecording();
      _movie.endRecording();
    });
  });

  describe("Chapter-5 new methods (authoring/printer no-ops)", () => {
    it("all return without throwing and don't crash", () => {
      expect(_movie.cancelIdleLoad()).toBe(true);
      expect(_movie.clearFrame()).toBeUndefined();
      expect(_movie.constrainH(0, 0)).toBe(0);
      expect(_movie.constrainV(0, 0)).toBe(0);
      expect(_movie.deleteFrame()).toBe(true);
      expect(_movie.duplicateFrame()).toBe(true);
      expect(_movie.finishIdleLoad()).toBe(true);
      expect(_movie.frameReady(1)).toBe(true);
      expect(_movie.label()).toBe("");
      expect(_movie.mergeDisplayTemplate()).toBe(true);
      expect(_movie.newMember(0, "x")).toBeNull();
      expect(_movie.preLoad()).toBe(true);
      expect(_movie.preLoadMember(0)).toBe(true);
      expect(_movie.preLoadMovie(0)).toBe(true);
      expect(_movie.printFrom()).toBe(true);
      expect(_movie.ramNeeded()).toBe(0);
      expect(_movie.saveMovie()).toBe(true);
      expect(_movie.sendAllSprites()).toBe(true);
      expect(_movie.sendSprite(0)).toBe(true);
      expect(_movie.unLoad()).toBe(true);
      expect(_movie.unLoadMember(0)).toBe(true);
      expect(_movie.unLoadMovie(0)).toBe(true);
      expect(_movie.updateFrame()).toBeUndefined();
    });
  });

  describe("Chapter-5 new props", () => {
    it("writable defaults work", () => {
      _movie.beepOn = false; expect(_movie.beepOn).toBe(false);
      _movie.buttonStyle = 1; expect(_movie.buttonStyle).toBe(1);
      _movie.centerStage = true; expect(_movie.centerStage).toBe(true);
      _movie.displayTemplate = "x"; expect(_movie.displayTemplate).toBe("x");
      _movie.dockingEnabled = false; expect(_movie.dockingEnabled).toBe(false);
      _movie.enableFlashLingo = false; expect(_movie.enableFlashLingo).toBe(false);
      _movie.fixStageSize = false; expect(_movie.fixStageSize).toBe(false);
      _movie.idleHandlerPeriod = 100; expect(_movie.idleHandlerPeriod).toBe(100);
      _movie.idleLoadMode = 1; expect(_movie.idleLoadMode).toBe(1);
      _movie.idleLoadPeriod = 2; expect(_movie.idleLoadPeriod).toBe(2);
      _movie.idleLoadTag = 3; expect(_movie.idleLoadTag).toBe(3);
      _movie.idleReadChunkSize = 4; expect(_movie.idleReadChunkSize).toBe(4);
      _movie.imageCompression = 5; expect(_movie.imageCompression).toBe(5);
      _movie.imageQuality = 6; expect(_movie.imageQuality).toBe(6);
      _movie.paletteMapping = 7; expect(_movie.paletteMapping).toBe(7);
      _movie.preLoadEventAbort = true; expect(_movie.preLoadEventAbort).toBe(true);
      _movie.traceLoad = true; expect(_movie.traceLoad).toBe(true);
      _movie.traceLogFile = "log.txt"; expect(_movie.traceLogFile).toBe("log.txt");
      _movie.updateLock = true; expect(_movie.updateLock).toBe(true);
      _movie.markerList = ["a"]; expect(_movie.markerList).toEqual(["a"]);
    });
    it("read-only defaults return documented empty/0/empty-string", () => {
      expect(_movie.aboutInfo).toBe("");
      expect(_movie.active3dRenderer).toBe("");
      expect(_movie.fileFreeSize).toBe(0);
      expect(_movie.fileSize).toBe(0);
      expect(_movie.fileVersion).toBe(0);
      expect(_movie.frameLabel).toBe("");
      expect(_movie.framePalette).toBe(0);
      expect(_movie.frameScript).toBe("");
      expect(_movie.frameSound1).toBe(0);
      expect(_movie.frameSound2).toBe(0);
      expect(_movie.frameTransition).toBe("");
      expect(_movie.lastFrame).toBe(0);
      expect(_movie.preferred3dRenderer).toBe("");
      expect(_movie.score).toBeNull();
      expect(_movie.scoreSelection).toBeNull();
      expect(_movie.script).toBe("");
      expect(_movie.useFastQuads).toBe(false);
    });
    it("read-only props throw on set", () => {
      for (const p of ["aboutInfo", "active3dRenderer", "fileFreeSize", "fileSize", "fileVersion",
        "frameLabel", "framePalette", "frameScript", "frameSound1", "frameSound2",
        "frameTransition", "lastFrame", "preferred3dRenderer", "score", "scoreSelection",
        "script", "useFastQuads", "xtraList", "timeoutList", "moviePath", "path", "name", "copyrightInfo", "lastChannel"]) {
        expect(() => { _movie[p] = "x"; }).toThrow();
      }
    });
  });

  describe("allow* (read-write)", () => {
    it("coerces to boolean", () => {
      _movie.allowCustomCaching = 0; expect(_movie.allowCustomCaching).toBe(false);
      _movie.allowGraphicMenu = 1; expect(_movie.allowGraphicMenu).toBe(true);
      _movie.allowSaveLocal = 0; expect(_movie.allowSaveLocal).toBe(false);
      _movie.allowTransportControl = 1; expect(_movie.allowTransportControl).toBe(true);
      _movie.allowVolumeControl = 0; expect(_movie.allowVolumeControl).toBe(false);
      _movie.allowZooming = 1; expect(_movie.allowZooming).toBe(true);
    });
  });
});
