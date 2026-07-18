import { describe, it, expect } from "vitest";
import { MovieObject } from "../movie.js";

const DOCUMENTED_METHODS = [
  "beginRecording",
  "cancelIdleLoad",
  "clearFrame",
  "constrainH",
  "constrainV",
  "delay",
  "deleteFrame",
  "duplicateFrame",
  "endRecording",
  "finishIdleLoad",
  "frameReady",
  "go",
  "goLoop",
  "goNext",
  "goPrevious",
  "idleLoadDone",
  "insertFrame",
  "label",
  "marker",
  "mergeDisplayTemplate",
  "newMember",
  "preLoad",
  "preLoadMember",
  "preLoadMovie",
  "printFrom",
  "puppetPalette",
  "puppetSprite",
  "puppetTempo",
  "puppetTransition",
  "ramNeeded",
  "rollOver",
  "saveMovie",
  "sendAllSprites",
  "sendSprite",
  "stopEvent",
  "unLoad",
  "unLoadMember",
  "unLoadMovie",
  "updateFrame",
  "updateStage",
];

describe("MovieObject (canon)", () => {
  describe("constructor defaults", () => {
    const m = new MovieObject();

    it("name === ''", () => {
      expect(m.name).toBe("");
    });

    it("frame === 0", () => {
      expect(m.frame).toBe(0);
    });

    it("frameTempo === 15", () => {
      expect(m.frameTempo).toBe(15);
    });

    it("path === ''", () => {
      expect(m.path).toBe("");
    });

    it("exitLock === false", () => {
      expect(m.exitLock).toBe(false);
    });

    it("aboutInfo === ''", () => {
      expect(m.aboutInfo).toBe("");
    });

    it("active3dRenderer === null", () => {
      expect(m.active3dRenderer).toBeNull();
    });

    it("beepOn === false", () => {
      expect(m.beepOn).toBe(false);
    });

    it("fileFreeSize === 0", () => {
      expect(m.fileFreeSize).toBe(0);
    });

    it("useFastQuads === false", () => {
      expect(m.useFastQuads).toBe(false);
    });

    it("actorList is an array", () => {
      expect(Array.isArray(m.actorList)).toBe(true);
    });

    it("castLib exists", () => {
      expect(m.castLib).toBeDefined();
    });

    it("member exists", () => {
      expect(m.member).toBeDefined();
    });

    it("sprite exists", () => {
      expect(m.sprite).toBeDefined();
    });

    it("stage exists (declared field)", () => {
      expect(m).toHaveProperty("stage");
    });

    it("score exists", () => {
      expect(m.score).toBeDefined();
    });

    it("markerList is an array", () => {
      expect(Array.isArray(m.markerList)).toBe(true);
    });

    it("xtraList exists", () => {
      expect(m.xtraList).toBeDefined();
    });

    it("lastFrame === 10", () => {
      expect(m.lastFrame).toBe(10);
    });
  });

  describe("documented methods are callable (no throw)", () => {
    const m = new MovieObject();

    it("updateFrame()", () => {
      expect(() => m.updateFrame()).not.toThrow();
    });

    it("go()", () => {
      expect(() => m.go("frame")).not.toThrow();
    });

    it("goLoop()", () => {
      expect(() => m.goLoop()).not.toThrow();
    });

    it("goNext()", () => {
      expect(() => m.goNext()).not.toThrow();
    });

    it("goPrevious()", () => {
      expect(() => m.goPrevious()).not.toThrow();
    });

    it("puppetTempo(15)", () => {
      expect(() => m.puppetTempo(15)).not.toThrow();
    });

    it("puppetTransition()", () => {
      expect(() => m.puppetTransition(1)).not.toThrow();
    });

    it("puppetPalette()", () => {
      expect(() => m.puppetPalette("Rainbow")).not.toThrow();
    });

    it("puppetSprite()", () => {
      expect(() => m.puppetSprite(1, true)).not.toThrow();
    });

    it("beginRecording()", () => {
      expect(() => m.beginRecording()).not.toThrow();
    });

    it("endRecording()", () => {
      expect(() => m.endRecording()).not.toThrow();
    });

    it("updateStage()", () => {
      expect(() => m.updateStage()).not.toThrow();
    });

    it("stopEvent()", () => {
      expect(() => m.stopEvent()).not.toThrow();
    });
  });

  describe("plain assignment (no throws)", () => {
    it("name = 'Intro'", () => {
      const m = new MovieObject();
      m.name = "Intro";
      expect(m.name).toBe("Intro");
    });

    it("frame = 5", () => {
      const m = new MovieObject();
      m.frame = 5;
      expect(m.frame).toBe(5);
    });

    it("exitLock = true", () => {
      const m = new MovieObject();
      m.exitLock = true;
      expect(m.exitLock).toBe(true);
    });
  });

  describe("no statics (FR-005)", () => {
    it("MovieObject._reset === undefined", () => {
      expect(MovieObject._reset).toBeUndefined();
    });

    it("MovieObject._register === undefined", () => {
      expect(MovieObject._register).toBeUndefined();
    });

    it("MovieObject.create === undefined", () => {
      expect(MovieObject.create).toBeUndefined();
    });

    it("MovieObject has no static own keys", () => {
      expect(Object.getOwnPropertyNames(MovieObject).filter(
        (k) => k !== "length" && k !== "name" && k !== "prototype",
      )).toEqual([]);
    });
  });

  describe("surface check", () => {
    for (const methodName of DOCUMENTED_METHODS) {
      it(`prototype has ${methodName}`, () => {
        expect(typeof MovieObject.prototype[methodName]).toBe("function");
      });
    }

    it("prototype surface matches Movie chapter Method summary", () => {
      const protoMethods = Object.getOwnPropertyNames(MovieObject.prototype).filter(
        (n) => n !== "constructor",
      );
      for (const methodName of DOCUMENTED_METHODS) {
        expect(protoMethods).toContain(methodName);
      }
    });

    it("instance has documented property fields", () => {
      const m = new MovieObject();
      for (const f of [
        "aboutInfo",
        "active3dRenderer",
        "actorList",
        "beepOn",
        "castLib",
        "exitLock",
        "fileFreeSize",
        "frame",
        "frameTempo",
        "lastFrame",
        "markerList",
        "member",
        "name",
        "path",
        "score",
        "sprite",
        "stage",
        "useFastQuads",
        "xtraList",
      ]) {
        expect(Object.prototype.hasOwnProperty.call(m, f)).toBe(true);
      }
    });
  });
});