import { describe, it, expect, beforeEach } from "vitest";
import { MovieRef, _movie } from "../movie-ref.js";
import { CastLibraryRef } from "../cast-library-ref.js";

describe("MovieRef", () => {
  beforeEach(() => {
    _movie._reset();
    CastLibraryRef._reset();
  });

  describe("singleton", () => {
    it("_movie is instance of MovieRef", () => {
      expect(_movie).toBeInstanceOf(MovieRef);
    });

    it("_movie is same reference on multiple imports", async () => {
      const { _movie: movie2 } = await import("../movie-ref.js");
      expect(movie2).toBe(_movie);
    });
  });

  describe("frame property (read-only)", () => {
    it("defaults to 1", () => {
      expect(_movie.frame).toBe(1);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.frame = 5;
      }).toThrow("frame is read-only");
    });

    it("updates via go()", () => {
      _movie.go(10);
      expect(_movie.frame).toBe(10);
    });
  });

  describe("frameTempo property (read-write)", () => {
    it("defaults to 0", () => {
      expect(_movie.frameTempo).toBe(0);
    });

    it("sets frameTempo", () => {
      _movie.frameTempo = 30;
      expect(_movie.frameTempo).toBe(30);
    });

    it("coerces to number", () => {
      _movie.frameTempo = "15";
      expect(_movie.frameTempo).toBe(15);
    });
  });

  describe("castLib property (indexed registry, read-only)", () => {
    it("returns a proxy object", () => {
      expect(_movie.castLib).toBeDefined();
      expect(typeof _movie.castLib).toBe("object");
    });

    it("returns null for empty registry", () => {
      expect(_movie.castLib[1]).toBeNull();
      expect(_movie.castLib["nonexistent"]).toBeNull();
    });

    it("accesses registered cast library by number", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Internal" });
      CastLibraryRef._register(castLib);
      expect(_movie.castLib[1]).toBe(castLib);
    });

    it("accesses registered cast library by name", () => {
      const castLib = new CastLibraryRef({ number: 1, name: "Internal" });
      CastLibraryRef._register(castLib);
      expect(_movie.castLib["Internal"]).toBe(castLib);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.castLib[1] = {};
      }).toThrow("castLib is read-only");
    });
  });

  describe("sprite property (indexed registry, read-only)", () => {
    it("returns a proxy object", () => {
      expect(_movie.sprite).toBeDefined();
      expect(typeof _movie.sprite).toBe("object");
    });

    it("returns null for empty registry", () => {
      expect(_movie.sprite[1]).toBeNull();
      expect(_movie.sprite["nonexistent"]).toBeNull();
    });

    it("accesses sprite by number after adding", () => {
      const mockSprite = { name: "button1", channel: 1 };
      _movie._addSprite(mockSprite);
      expect(_movie.sprite[1]).toBe(mockSprite);
    });

    it("accesses sprite by name after adding", () => {
      const mockSprite = { name: "button1", channel: 1 };
      _movie._addSprite(mockSprite);
      expect(_movie.sprite["button1"]).toBe(mockSprite);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.sprite[1] = {};
      }).toThrow("sprite is read-only");
    });

    it("supports has check by number", () => {
      const mockSprite = { name: "test", channel: 1 };
      _movie._addSprite(mockSprite);
      expect(1 in _movie.sprite).toBe(true);
      expect(2 in _movie.sprite).toBe(false);
    });
  });

  describe("member property (indexed registry, read-only)", () => {
    it("returns a proxy object", () => {
      expect(_movie.member).toBeDefined();
      expect(typeof _movie.member).toBe("object");
    });

    it("returns null for empty registry", () => {
      expect(_movie.member[1]).toBeNull();
      expect(_movie.member["nonexistent"]).toBeNull();
    });

    it("accesses member by number after adding", () => {
      const mockMember = { name: "Athlete", number: 2 };
      _movie._addMember(mockMember);
      expect(_movie.member[1]).toBe(mockMember);
    });

    it("accesses member by name after adding", () => {
      const mockMember = { name: "Athlete", number: 2 };
      _movie._addMember(mockMember);
      expect(_movie.member["Athlete"]).toBe(mockMember);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.member[1] = {};
      }).toThrow("member is read-only");
    });
  });

  describe("name property (read-only)", () => {
    it("defaults to empty string", () => {
      expect(_movie.name).toBe("");
    });

    it("returns set name", () => {
      _movie._setName("TestMovie");
      expect(_movie.name).toBe("TestMovie");
    });

    it("throws when attempting to set directly", () => {
      expect(() => {
        _movie.name = "NewName";
      }).toThrow("name is read-only");
    });
  });

  describe("path property (read-only)", () => {
    it("defaults to empty string", () => {
      expect(_movie.path).toBe("");
    });

    it("returns set path", () => {
      _movie._setPath("/movies/test/");
      expect(_movie.path).toBe("/movies/test/");
    });

    it("throws when attempting to set directly", () => {
      expect(() => {
        _movie.path = "/new/path/";
      }).toThrow("path is read-only");
    });
  });

  describe("moviePath property (read-only)", () => {
    it("defaults to empty string", () => {
      expect(_movie.moviePath).toBe("");
    });

    it("returns set moviePath", () => {
      _movie._setMoviePath("/movies/test.dcr");
      expect(_movie.moviePath).toBe("/movies/test.dcr");
    });

    it("throws when attempting to set directly", () => {
      expect(() => {
        _movie.moviePath = "/new.dcr";
      }).toThrow("moviePath is read-only");
    });
  });

  describe("copyrightInfo property (read-only)", () => {
    it("defaults to empty string", () => {
      expect(_movie.copyrightInfo).toBe("");
    });

    it("returns set copyrightInfo", () => {
      _movie._setCopyrightInfo("(c) 2024");
      expect(_movie.copyrightInfo).toBe("(c) 2024");
    });

    it("throws when attempting to set directly", () => {
      expect(() => {
        _movie.copyrightInfo = "new";
      }).toThrow("copyrightInfo is read-only");
    });
  });

  describe("stage property (read-only)", () => {
    it("returns a proxy object", () => {
      expect(_movie.stage).toBeDefined();
      expect(typeof _movie.stage).toBe("object");
    });

    it("has left, top, right, bottom properties", () => {
      expect(_movie.stage.left).toBe(0);
      expect(_movie.stage.top).toBe(0);
      expect(_movie.stage.right).toBe(640);
      expect(_movie.stage.bottom).toBe(480);
    });

    it("has rect property", () => {
      expect(_movie.stage.rect).toEqual({ left: 0, top: 0, right: 640, bottom: 480 });
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.stage.left = 100;
      }).toThrow("stage is read-only");
    });
  });

  describe("lastChannel property (read-only)", () => {
    it("defaults to 0", () => {
      expect(_movie.lastChannel).toBe(0);
    });

    it("returns set lastChannel", () => {
      _movie._setLastChannel(8);
      expect(_movie.lastChannel).toBe(8);
    });

    it("throws when attempting to set directly", () => {
      expect(() => {
        _movie.lastChannel = 10;
      }).toThrow("lastChannel is read-only");
    });
  });

  describe("exitLock property (read-write)", () => {
    it("defaults to false", () => {
      expect(_movie.exitLock).toBe(false);
    });

    it("sets exitLock to true", () => {
      _movie.exitLock = true;
      expect(_movie.exitLock).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      _movie.exitLock = 1;
      expect(_movie.exitLock).toBe(true);
      _movie.exitLock = 0;
      expect(_movie.exitLock).toBe(false);
    });
  });

  describe("editShortCutsEnabled property (read-write)", () => {
    it("defaults to true", () => {
      expect(_movie.editShortCutsEnabled).toBe(true);
    });

    it("sets editShortCutsEnabled to false", () => {
      _movie.editShortCutsEnabled = false;
      expect(_movie.editShortCutsEnabled).toBe(false);
    });

    it("coerces truthy values to boolean", () => {
      _movie.editShortCutsEnabled = 0;
      expect(_movie.editShortCutsEnabled).toBe(false);
      _movie.editShortCutsEnabled = 1;
      expect(_movie.editShortCutsEnabled).toBe(true);
    });
  });

  describe("keyboardFocusSprite property (read-write)", () => {
    it("defaults to 0", () => {
      expect(_movie.keyboardFocusSprite).toBe(0);
    });

    it("sets keyboardFocusSprite", () => {
      _movie.keyboardFocusSprite = 5;
      expect(_movie.keyboardFocusSprite).toBe(5);
    });

    it("sets to -1 to return focus to Score", () => {
      _movie.keyboardFocusSprite = -1;
      expect(_movie.keyboardFocusSprite).toBe(-1);
    });

    it("coerces to number", () => {
      _movie.keyboardFocusSprite = "3";
      expect(_movie.keyboardFocusSprite).toBe(3);
    });
  });

  describe("traceScript property (read-write)", () => {
    it("defaults to false", () => {
      expect(_movie.traceScript).toBe(false);
    });

    it("sets traceScript to true", () => {
      _movie.traceScript = true;
      expect(_movie.traceScript).toBe(true);
    });

    it("coerces truthy values to boolean", () => {
      _movie.traceScript = 1;
      expect(_movie.traceScript).toBe(true);
      _movie.traceScript = 0;
      expect(_movie.traceScript).toBe(false);
    });
  });

  describe("actorList property (read-write)", () => {
    it("defaults to empty array", () => {
      expect(_movie.actorList).toEqual([]);
    });

    it("sets actorList", () => {
      const actors = [{ stepFrame: () => {} }];
      _movie.actorList = actors;
      expect(_movie.actorList).toBe(actors);
    });

    it("clears actorList with empty array", () => {
      _movie.actorList = [{ stepFrame: () => {} }];
      _movie.actorList = [];
      expect(_movie.actorList).toEqual([]);
    });

    it("sets to empty array if not array", () => {
      _movie.actorList = "not an array";
      expect(_movie.actorList).toEqual([]);
    });
  });

  describe("timeoutList property (read-only)", () => {
    it("defaults to empty array", () => {
      expect(_movie.timeoutList).toEqual([]);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.timeoutList = [];
      }).toThrow("timeoutList is read-only");
    });
  });

  describe("xtraList property (read-only)", () => {
    it("defaults to empty array", () => {
      expect(_movie.xtraList).toEqual([]);
    });

    it("throws when attempting to set", () => {
      expect(() => {
        _movie.xtraList = [];
      }).toThrow("xtraList is read-only");
    });
  });

  describe("go() method", () => {
    it("navigates to specified frame", () => {
      _movie.go(5);
      expect(_movie.frame).toBe(5);
    });

    it("navigates to frame 1", () => {
      _movie.go(10);
      _movie.go(1);
      expect(_movie.frame).toBe(1);
    });

    it("ignores non-number arguments", () => {
      _movie.go(5);
      _movie.go("invalid");
      expect(_movie.frame).toBe(5);
    });
  });

  describe("halt() method", () => {
    it("stops playback", () => {
      _movie.halt();
    });
  });

  describe("puppetSprite() method", () => {
    it("puppets a sprite", () => {
      _movie.puppetSprite(1, true);
    });

    it("unpuppets a sprite", () => {
      _movie.puppetSprite(1, true);
      _movie.puppetSprite(1, false);
    });
  });

  describe("puppetTempo() method", () => {
    it("sets tempo", () => {
      _movie.puppetTempo(30);
      expect(_movie.frameTempo).toBe(30);
    });

    it("overrides frameTempo", () => {
      _movie.frameTempo = 15;
      _movie.puppetTempo(60);
      expect(_movie.frameTempo).toBe(60);
    });
  });

  describe("rollOver() method", () => {
    it("returns false by default", () => {
      expect(_movie.rollOver(1)).toBe(false);
    });
  });

  describe("stopEvent() method", () => {
    it("exists and is callable", () => {
      expect(typeof _movie.stopEvent).toBe("function");
      _movie.stopEvent();
    });
  });

  describe("updateStage() method", () => {
    it("exists and is callable", () => {
      expect(typeof _movie.updateStage).toBe("function");
      _movie.updateStage();
    });
  });
});
