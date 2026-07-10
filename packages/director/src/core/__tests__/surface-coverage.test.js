import { describe, it, expect } from "vitest";
import { CastLibraryObject } from "../cast-library-object.js";
import { GlobalObject } from "../global-object.js";
import { KeyObject } from "../key-object.js";
import { MemberObject } from "../member-object.js";
import { MouseObject } from "../mouse-object.js";
import { MovieObject } from "../movie-object.js";
import { PlayerObject } from "../player-object.js";
import { SoundObject } from "../sound-object.js";
import { SoundChannelObject } from "../sound-channel-object.js";
import { SpriteObject } from "../sprite-object.js";
import { SpriteChannelObject } from "../sprite-channel-object.js";
import { SystemObject } from "../system-object.js";
import { WindowObject } from "../window-object.js";

function members(instance) {
  const s = new Set();
  let proto = Object.getPrototypeOf(instance);
  while (proto && proto !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(proto)) {
      if (name === "constructor") continue;
      s.add(name);
    }
    proto = Object.getPrototypeOf(proto);
  }
  for (const name of Object.getOwnPropertyNames(instance)) {
    s.add(name);
  }
  return s;
}

describe("Chapter-5 surface coverage", () => {
  it("CastLibraryObject exposes findEmpty + the documented props", () => {
    const c = new CastLibraryObject();
    const m = members(c);
    expect(m.has("findEmpty")).toBe(true);
    expect(m.has("fileName")).toBe(true);
    expect(m.has("member")).toBe(true);
    expect(m.has("name")).toBe(true);
    expect(m.has("number")).toBe(true);
    expect(m.has("preLoadMode")).toBe(true);
    expect(m.has("selection")).toBe(true);
  });

  it("GlobalObject exposes clearGlobals + showGlobals", () => {
    const g = new GlobalObject();
    const m = members(g);
    expect(m.has("clearGlobals")).toBe(true);
    expect(m.has("showGlobals")).toBe(true);
  });

  it("KeyObject exposes keyPressed + 6 props", () => {
    const k = new KeyObject();
    const m = members(k);
    expect(m.has("keyPressed")).toBe(true);
    for (const p of ["commandDown", "controlDown", "key", "keyCode", "optionDown", "shiftDown"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("MemberObject exposes 8 methods + 22 props", () => {
    const o = new MemberObject(Symbol.for("bitmap"), "x");
    const m = members(o);
    for (const fn of ["copyToClipBoard", "duplicate", "erase", "importFileInto",
      "move", "pasteClipBoardInto", "preLoad", "unLoad"]) {
      expect(m.has(fn)).toBe(true);
    }
    for (const p of ["castLibNum", "comments", "creationDate", "fileName", "height", "hilite",
      "linked", "loaded", "media", "mediaReady", "modified", "modifiedBy", "modifiedDate",
      "name", "number", "purgePriority", "rect", "regPoint", "scriptText", "size",
      "thumbNail", "type", "width"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("MouseObject exposes 17 read-only props", () => {
    const m = members(new MouseObject());
    for (const p of ["clickLoc", "clickOn", "doubleClick", "mouseChar", "mouseDown", "mouseH",
      "mouseItem", "mouseLine", "mouseLoc", "mouseMember", "mouseUp", "mouseV", "mouseWord",
      "rightMouseDown", "rightMouseUp", "stillDown"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("MovieObject exposes documented surface (sample)", () => {
    const m = members(new MovieObject());
    for (const fn of ["beginRecording", "endRecording", "go", "goLoop", "goNext", "goPrevious",
      "puppetPalette", "puppetSprite", "puppetTempo", "puppetTransition", "updateFrame"]) {
      expect(m.has(fn)).toBe(true);
    }
    for (const p of ["frame", "frameTempo", "name", "path", "actorList", "exitLock",
      "keyboardFocusSprite", "castLib", "member", "sprite", "stage", "score", "markerList",
      "xtraList", "aboutInfo", "active3dRenderer", "beepOn", "fileFreeSize", "useFastQuads"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("PlayerObject exposes documented surface (sample)", () => {
    const m = members(new PlayerObject());
    for (const fn of ["alert", "appMinimize", "cursor", "externalParamName", "externalParamValue",
      "flushInputEvents", "getPref", "halt", "open", "quit", "setPref", "windowPresent"]) {
      expect(m.has(fn)).toBe(true);
    }
    for (const p of ["activeCastLib", "activeWindow", "applicationName", "applicationPath",
      "currentSpriteNum", "digitalVideoTimeScale", "disableImagingTransformation",
      "emulateMultibuttonMouse", "externalParamCount", "frontWindow", "inlineImeEnabled",
      "lastClick", "lastEvent", "lastKey", "lastRoll", "mediaXtraList", "netPresent",
      "netThrottleTicks", "organizationName", "productName", "productVersion", "safePlayer",
      "scriptingXtraList", "searchCurrentFolder", "searchPathList", "serialNumber",
      "switchColorDepth", "toolXtraList", "transitionXtraList", "userName", "window", "windowList"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("SoundObject exposes beep + channel + device props", () => {
    const m = members(new SoundObject());
    expect(m.has("beep")).toBe(true);
    expect(m.has("channel")).toBe(true);
    for (const p of ["soundDevice", "soundDeviceList", "soundEnabled", "soundKeepDevice",
      "soundLevel", "soundMixMedia"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("SoundChannelObject exposes 14 methods + 14 props", () => {
    const c = new SoundChannelObject(1);
    const m = members(c);
    for (const fn of ["breakLoop", "fadeIn", "fadeOut", "fadeTo", "getPlayList", "isBusy",
      "pause", "play", "playFile", "playNext", "queue", "rewind", "setPlayList", "stop"]) {
      expect(m.has(fn)).toBe(true);
    }
    for (const p of ["channel", "channelCount", "elapsedTime", "endTime", "loop", "loopCount",
      "loopEndTime", "loopStartTime", "loopsRemaining", "member", "pan", "sampleCount",
      "sampleRate", "startTime", "status", "volume"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("SpriteObject exposes 28 props", () => {
    const m = members(new SpriteObject(1));
    for (const p of ["backColor", "blend", "bottom", "constraint", "cursor", "editable",
      "endFrame", "flipH", "flipV", "foreColor", "height", "ink", "left", "locH", "locV",
      "locZ", "member", "name", "quad", "rect", "right", "rotation", "skew", "spriteNum",
      "startFrame", "top", "width"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("SpriteChannelObject exposes 2 methods + 4 props", () => {
    const m = members(new SpriteChannelObject(1));
    expect(m.has("makeScriptedSprite")).toBe(true);
    expect(m.has("removeScriptedSprite")).toBe(true);
    for (const p of ["name", "number", "scripted", "sprite"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("SystemObject exposes 4 methods + 4 props", () => {
    const m = members(new SystemObject());
    for (const fn of ["date", "restart", "shutDown", "time"]) {
      expect(m.has(fn)).toBe(true);
    }
    for (const p of ["colorDepth", "deskTopRectList", "environmentPropList", "milliseconds"]) {
      expect(m.has(p)).toBe(true);
    }
  });

  it("WindowObject exposes 9 methods + 19 props", () => {
    const w = new WindowObject("X");
    const m = members(w);
    for (const fn of ["close", "forget", "maximize", "mergeProps", "minimize", "moveToBack",
      "moveToFront", "open", "restore"]) {
      expect(m.has(fn)).toBe(true);
    }
    for (const p of ["appearanceOptions", "bgColor", "dockingEnabled", "drawRect", "fileName",
      "image", "movie", "name", "picture", "rect", "resizable", "sizeState", "sourceRect",
      "title", "titlebarOptions", "type", "visible", "windowBehind", "windowInFront"]) {
      expect(m.has(p)).toBe(true);
    }
  });
});
