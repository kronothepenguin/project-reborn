import { CastLibraryObject } from "./cast-library-object.js";
import { WindowObject } from "./window-object.js";

export class MovieObject {
  #frame = 1;
  #frameTempo = 0;
  #name = "";
  #path = "";
  #moviePath = "";
  #copyrightInfo = "";
  #lastChannel = 0;
  #exitLock = false;
  #editShortCutsEnabled = true;
  #keyboardFocusSprite = 0;
  #traceScript = false;
  #actorList = [];
  #timeoutList = [];
  #xtraList = [];
  #markerList = [];
  #aboutInfo = "";
  #active3dRenderer = "";
  #beepOn = true;
  #buttonStyle = 0;
  #centerStage = false;
  #displayTemplate = "";
  #dockingEnabled = true;
  #enableFlashLingo = true;
  #fileFreeSize = 0;
  #fileSize = 0;
  #fileVersion = 0;
  #fixStageSize = true;
  #frameLabel = "";
  #framePalette = 0;
  #frameScript = "";
  #frameSound1 = 0;
  #frameSound2 = 0;
  #frameTransition = "";
  #idleHandlerPeriod = 0;
  #idleLoadMode = 0;
  #idleLoadPeriod = 0;
  #idleLoadTag = 0;
  #idleReadChunkSize = 0;
  #imageCompression = 0;
  #imageQuality = 0;
  #lastFrame = 0;
  #paletteMapping = 0;
  #preferred3dRenderer = "";
  #preLoadEventAbort = false;
  #score = null;
  #scoreSelection = null;
  #script = "";
  #traceLoad = false;
  #traceLogFile = "";
  #updateLock = false;
  #useFastQuads = false;
  #allowCustomCaching = true;
  #allowGraphicMenu = true;
  #allowSaveLocal = true;
  #allowTransportControl = true;
  #allowVolumeControl = true;
  #allowZooming = true;
  #sprites = [];
  #spritesByName = new Map();
  #members = [];
  #membersByName = new Map();
  #halted = false;
  #puppetSprites = new Map();
  #puppetTempo = null;
  #recording = false;

  constructor() {
    this.castLib = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        return CastLibraryObject.castLib[prop];
      },
      has: (_target, prop) => {
        return prop in CastLibraryObject.castLib;
      },
      set: () => {
        throw new Error("castLib is read-only");
      },
      ownKeys: () => {
        return Reflect.ownKeys(CastLibraryObject.castLib);
      },
      getOwnPropertyDescriptor: (_target, prop) => {
        return Object.getOwnPropertyDescriptor(CastLibraryObject.castLib, prop);
      },
    });

    this.sprite = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          return this.#sprites[Number(prop) - 1] ?? null;
        }
        return this.#spritesByName.get(prop) ?? null;
      },
      has: (_target, prop) => {
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          return Number(prop) >= 1 && Number(prop) <= this.#sprites.length;
        }
        return this.#spritesByName.has(prop);
      },
      set: () => {
        throw new Error("sprite is read-only");
      },
      ownKeys: () => {
        return this.#sprites.map((_, i) => String(i + 1));
      },
      getOwnPropertyDescriptor: (_target, prop) => {
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          const idx = Number(prop) - 1;
          if (idx >= 0 && idx < this.#sprites.length) {
            return { configurable: true, enumerable: true, value: this.#sprites[idx] };
          }
        }
        return undefined;
      },
    });

    this.member = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          return this.#members[Number(prop) - 1] ?? null;
        }
        return this.#membersByName.get(prop) ?? null;
      },
      has: (_target, prop) => {
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          return Number(prop) >= 1 && Number(prop) <= this.#members.length;
        }
        return this.#membersByName.has(prop);
      },
      set: () => {
        throw new Error("member is read-only");
      },
      ownKeys: () => {
        return this.#members.map((_, i) => String(i + 1));
      },
      getOwnPropertyDescriptor: (_target, prop) => {
        if (typeof prop === "number" || /^\d+$/.test(prop)) {
          const idx = Number(prop) - 1;
          if (idx >= 0 && idx < this.#members.length) {
            return { configurable: true, enumerable: true, value: this.#members[idx] };
          }
        }
        return undefined;
      },
    });

    this.stage = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        switch (prop) {
          case "left": return 0;
          case "top": return 0;
          case "right": return 640;
          case "bottom": return 480;
          case "rect": return { left: 0, top: 0, right: 640, bottom: 480 };
          default: return undefined;
        }
      },
      has: (_target, prop) => {
        return ["left", "top", "right", "bottom", "rect"].includes(prop);
      },
      set: () => {
        throw new Error("stage is read-only");
      },
    });
  }

  get frame() {
    return this.#frame;
  }

  set frame(_value) {
    throw new Error("frame is read-only");
  }

  get frameTempo() {
    return this.#frameTempo;
  }

  set frameTempo(value) {
    this.#frameTempo = Number(value);
  }

  get name() {
    return this.#name;
  }

  set name(_value) {
    throw new Error("name is read-only");
  }

  get path() {
    return this.#path;
  }

  set path(_value) {
    throw new Error("path is read-only");
  }

  get moviePath() {
    return this.#moviePath;
  }

  set moviePath(_value) {
    throw new Error("moviePath is read-only");
  }

  get copyrightInfo() {
    return this.#copyrightInfo;
  }

  set copyrightInfo(_value) {
    throw new Error("copyrightInfo is read-only");
  }

  get lastChannel() {
    return this.#lastChannel;
  }

  set lastChannel(_value) {
    throw new Error("lastChannel is read-only");
  }

  get exitLock() {
    return this.#exitLock;
  }

  set exitLock(value) {
    this.#exitLock = Boolean(value);
  }

  get editShortCutsEnabled() {
    return this.#editShortCutsEnabled;
  }

  set editShortCutsEnabled(value) {
    this.#editShortCutsEnabled = Boolean(value);
  }

  get keyboardFocusSprite() {
    return this.#keyboardFocusSprite;
  }

  set keyboardFocusSprite(value) {
    this.#keyboardFocusSprite = Number(value);
  }

  get traceScript() {
    return this.#traceScript;
  }

  set traceScript(value) {
    this.#traceScript = Boolean(value);
  }

  get actorList() {
    return this.#actorList;
  }

  set actorList(value) {
    this.#actorList = Array.isArray(value) ? value : [];
  }

  get timeoutList() {
    return this.#timeoutList;
  }

  set timeoutList(_value) {
    throw new Error("timeoutList is read-only");
  }

  get xtraList() {
    return this.#xtraList;
  }

  set xtraList(_value) {
    throw new Error("xtraList is read-only");
  }

  get markerList() {
    return this.#markerList;
  }

  set markerList(value) {
    this.#markerList = Array.isArray(value) ? value : [];
  }

  get aboutInfo() {
    return this.#aboutInfo;
  }

  set aboutInfo(_value) {
    throw new Error("aboutInfo is read-only");
  }

  get active3dRenderer() {
    return this.#active3dRenderer;
  }

  set active3dRenderer(_value) {
    throw new Error("active3dRenderer is read-only");
  }

  get beepOn() {
    return this.#beepOn;
  }

  set beepOn(value) {
    this.#beepOn = Boolean(value);
  }

  get buttonStyle() {
    return this.#buttonStyle;
  }

  set buttonStyle(value) {
    this.#buttonStyle = Number(value);
  }

  get centerStage() {
    return this.#centerStage;
  }

  set centerStage(value) {
    this.#centerStage = Boolean(value);
  }

  get displayTemplate() {
    return this.#displayTemplate;
  }

  set displayTemplate(value) {
    this.#displayTemplate = String(value ?? "");
  }

  get dockingEnabled() {
    return this.#dockingEnabled;
  }

  set dockingEnabled(value) {
    this.#dockingEnabled = Boolean(value);
  }

  get enableFlashLingo() {
    return this.#enableFlashLingo;
  }

  set enableFlashLingo(value) {
    this.#enableFlashLingo = Boolean(value);
  }

  get fileFreeSize() {
    return this.#fileFreeSize;
  }

  set fileFreeSize(_value) {
    throw new Error("fileFreeSize is read-only");
  }

  get fileSize() {
    return this.#fileSize;
  }

  set fileSize(_value) {
    throw new Error("fileSize is read-only");
  }

  get fileVersion() {
    return this.#fileVersion;
  }

  set fileVersion(_value) {
    throw new Error("fileVersion is read-only");
  }

  get fixStageSize() {
    return this.#fixStageSize;
  }

  set fixStageSize(value) {
    this.#fixStageSize = Boolean(value);
  }

  get frameLabel() {
    return this.#frameLabel;
  }

  set frameLabel(_value) {
    throw new Error("frameLabel is read-only");
  }

  get framePalette() {
    return this.#framePalette;
  }

  set framePalette(_value) {
    throw new Error("framePalette is read-only");
  }

  get frameScript() {
    return this.#frameScript;
  }

  set frameScript(_value) {
    throw new Error("frameScript is read-only");
  }

  get frameSound1() {
    return this.#frameSound1;
  }

  set frameSound1(_value) {
    throw new Error("frameSound1 is read-only");
  }

  get frameSound2() {
    return this.#frameSound2;
  }

  set frameSound2(_value) {
    throw new Error("frameSound2 is read-only");
  }

  get frameTransition() {
    return this.#frameTransition;
  }

  set frameTransition(_value) {
    throw new Error("frameTransition is read-only");
  }

  get idleHandlerPeriod() {
    return this.#idleHandlerPeriod;
  }

  set idleHandlerPeriod(value) {
    this.#idleHandlerPeriod = Number(value);
  }

  get idleLoadMode() {
    return this.#idleLoadMode;
  }

  set idleLoadMode(value) {
    this.#idleLoadMode = Number(value);
  }

  get idleLoadPeriod() {
    return this.#idleLoadPeriod;
  }

  set idleLoadPeriod(value) {
    this.#idleLoadPeriod = Number(value);
  }

  get idleLoadTag() {
    return this.#idleLoadTag;
  }

  set idleLoadTag(value) {
    this.#idleLoadTag = Number(value);
  }

  get idleReadChunkSize() {
    return this.#idleReadChunkSize;
  }

  set idleReadChunkSize(value) {
    this.#idleReadChunkSize = Number(value);
  }

  get imageCompression() {
    return this.#imageCompression;
  }

  set imageCompression(value) {
    this.#imageCompression = Number(value);
  }

  get imageQuality() {
    return this.#imageQuality;
  }

  set imageQuality(value) {
    this.#imageQuality = Number(value);
  }

  get lastFrame() {
    return this.#lastFrame;
  }

  set lastFrame(_value) {
    throw new Error("lastFrame is read-only");
  }

  get paletteMapping() {
    return this.#paletteMapping;
  }

  set paletteMapping(value) {
    this.#paletteMapping = Number(value);
  }

  get preferred3dRenderer() {
    return this.#preferred3dRenderer;
  }

  set preferred3dRenderer(_value) {
    throw new Error("preferred3dRenderer is read-only");
  }

  get preLoadEventAbort() {
    return this.#preLoadEventAbort;
  }

  set preLoadEventAbort(value) {
    this.#preLoadEventAbort = Boolean(value);
  }

  get score() {
    return this.#score;
  }

  set score(_value) {
    throw new Error("score is read-only");
  }

  get scoreSelection() {
    return this.#scoreSelection;
  }

  set scoreSelection(_value) {
    throw new Error("scoreSelection is read-only");
  }

  get script() {
    return this.#script;
  }

  set script(_value) {
    throw new Error("script is read-only");
  }

  get traceLoad() {
    return this.#traceLoad;
  }

  set traceLoad(value) {
    this.#traceLoad = Boolean(value);
  }

  get traceLogFile() {
    return this.#traceLogFile;
  }

  set traceLogFile(value) {
    this.#traceLogFile = String(value ?? "");
  }

  get updateLock() {
    return this.#updateLock;
  }

  set updateLock(value) {
    this.#updateLock = Boolean(value);
  }

  get useFastQuads() {
    return this.#useFastQuads;
  }

  set useFastQuads(_value) {
    throw new Error("useFastQuads is read-only");
  }

  get allowCustomCaching() {
    return this.#allowCustomCaching;
  }

  set allowCustomCaching(value) {
    this.#allowCustomCaching = Boolean(value);
  }

  get allowGraphicMenu() {
    return this.#allowGraphicMenu;
  }

  set allowGraphicMenu(value) {
    this.#allowGraphicMenu = Boolean(value);
  }

  get allowSaveLocal() {
    return this.#allowSaveLocal;
  }

  set allowSaveLocal(value) {
    this.#allowSaveLocal = Boolean(value);
  }

  get allowTransportControl() {
    return this.#allowTransportControl;
  }

  set allowTransportControl(value) {
    this.#allowTransportControl = Boolean(value);
  }

  get allowVolumeControl() {
    return this.#allowVolumeControl;
  }

  set allowVolumeControl(value) {
    this.#allowVolumeControl = Boolean(value);
  }

  get allowZooming() {
    return this.#allowZooming;
  }

  set allowZooming(value) {
    this.#allowZooming = Boolean(value);
  }

  go(frame) {
    if (typeof frame === "number") {
      this.#frame = frame;
    }
  }

  halt() {
    this.#halted = true;
  }

  puppetSprite(channel, flag) {
    if (flag) {
      this.#puppetSprites.set(channel, true);
    } else {
      this.#puppetSprites.delete(channel);
    }
  }

  puppetTempo(tempo) {
    this.#puppetTempo = tempo;
    this.#frameTempo = Number(tempo);
  }

  puppetPalette(_palette) {
    return true;
  }

  puppetTransition() {
    return true;
  }

  beginRecording() {
    this.#recording = true;
    this.#frame = this.#frame + 1;
  }

  endRecording() {
    this.#recording = false;
  }

  insertFrame() {
    this.#frame = this.#frame + 1;
  }

  clearFrame() {
    this.#frame = this.#frame;
  }

  deleteFrame() {
    return true;
  }

  duplicateFrame() {
    return true;
  }

  constrainH(_value, _whichSprite) {
    return 0;
  }

  constrainV(_value, _whichSprite) {
    return 0;
  }

  delay(intTicks) {
    const ticks = Math.max(0, Math.trunc(Number(intTicks) || 0));
    this.#frame = this.#frame;
  }

  finishIdleLoad() {
    return true;
  }

  frameReady(_whichFrame) {
    return true;
  }

  idleLoadDone(_intLoadTag) {
    return true;
  }

  cancelIdleLoad() {
    return true;
  }

  label() {
    return "";
  }

  marker(markerNameOrNum) {
    if (typeof markerNameOrNum === "string") {
      return this.#frame;
    }
    if (typeof markerNameOrNum === "number") {
      return this.#frame + markerNameOrNum;
    }
    return 0;
  }

  mergeDisplayTemplate() {
    return true;
  }

  newMember(_type, _name) {
    return null;
  }

  preLoad() {
    return true;
  }

  preLoadMember(_whichMember) {
    return true;
  }

  preLoadMovie(_movie) {
    return true;
  }

  printFrom() {
    return true;
  }

  ramNeeded() {
    return 0;
  }

  rollOver(_sprite) {
    return false;
  }

  saveMovie() {
    return true;
  }

  sendAllSprites() {
    return true;
  }

  sendSprite(_whichSprite) {
    return true;
  }

  goNext() {
  }

  goPrevious() {
  }

  goLoop() {
  }

  stopEvent() {
  }

  updateFrame() {
  }

  updateStage() {
  }

  unLoad() {
    return true;
  }

  unLoadMember(_whichMember) {
    return true;
  }

  unLoadMovie(_movie) {
    return true;
  }

  _addSprite(spriteObject) {
    this.#sprites.push(spriteObject);
    if (spriteObject && spriteObject.name) {
      this.#spritesByName.set(spriteObject.name, spriteObject);
    }
  }

  _addMember(memberObject) {
    this.#members.push(memberObject);
    if (memberObject && memberObject.name) {
      this.#membersByName.set(memberObject.name, memberObject);
    }
  }

  _setName(value) {
    this.#name = value;
  }

  _setPath(value) {
    this.#path = value;
  }

  _setMoviePath(value) {
    this.#moviePath = value;
  }

  _setCopyrightInfo(value) {
    this.#copyrightInfo = value;
  }

  _setLastChannel(value) {
    this.#lastChannel = value;
  }

  _setFrame(value) {
    this.#frame = value;
  }

  _reset() {
    this.#frame = 1;
    this.#frameTempo = 0;
    this.#name = "";
    this.#path = "";
    this.#moviePath = "";
    this.#copyrightInfo = "";
    this.#lastChannel = 0;
    this.#exitLock = false;
    this.#editShortCutsEnabled = true;
    this.#keyboardFocusSprite = 0;
    this.#traceScript = false;
    this.#actorList = [];
    this.#timeoutList = [];
    this.#xtraList = [];
    this.#markerList = [];
    this.#sprites = [];
    this.#spritesByName = new Map();
    this.#members = [];
    this.#membersByName = new Map();
    this.#halted = false;
    this.#puppetSprites = new Map();
    this.#puppetTempo = null;
    this.#recording = false;
    this.#aboutInfo = "";
    this.#active3dRenderer = "";
    this.#beepOn = true;
    this.#buttonStyle = 0;
    this.#centerStage = false;
    this.#displayTemplate = "";
    this.#dockingEnabled = true;
    this.#enableFlashLingo = true;
    this.#fileFreeSize = 0;
    this.#fileSize = 0;
    this.#fileVersion = 0;
    this.#fixStageSize = true;
    this.#frameLabel = "";
    this.#framePalette = 0;
    this.#frameScript = "";
    this.#frameSound1 = 0;
    this.#frameSound2 = 0;
    this.#frameTransition = "";
    this.#idleHandlerPeriod = 0;
    this.#idleLoadMode = 0;
    this.#idleLoadPeriod = 0;
    this.#idleLoadTag = 0;
    this.#idleReadChunkSize = 0;
    this.#imageCompression = 0;
    this.#imageQuality = 0;
    this.#lastFrame = 0;
    this.#paletteMapping = 0;
    this.#preferred3dRenderer = "";
    this.#preLoadEventAbort = false;
    this.#score = null;
    this.#scoreSelection = null;
    this.#script = "";
    this.#traceLoad = false;
    this.#traceLogFile = "";
    this.#updateLock = false;
    this.#useFastQuads = false;
  }
}

export const _movie = new MovieObject();
