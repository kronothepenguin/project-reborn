import { CastLibraryRef } from "./cast-library-ref.js";

export class MovieRef {
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
  #sprites = [];
  #spritesByName = new Map();
  #members = [];
  #membersByName = new Map();
  #halted = false;
  #puppetSprites = new Map();
  #puppetTempo = null;

  constructor() {
    this.castLib = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        return CastLibraryRef.castLib[prop];
      },
      has: (_target, prop) => {
        return prop in CastLibraryRef.castLib;
      },
      set: () => {
        throw new Error("castLib is read-only");
      },
      ownKeys: () => {
        return Reflect.ownKeys(CastLibraryRef.castLib);
      },
      getOwnPropertyDescriptor: (_target, prop) => {
        return Object.getOwnPropertyDescriptor(CastLibraryRef.castLib, prop);
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

  rollOver(_sprite) {
    return false;
  }

  stopEvent() {
  }

  updateStage() {
  }

  _addSprite(spriteRef) {
    this.#sprites.push(spriteRef);
    if (spriteRef && spriteRef.name) {
      this.#spritesByName.set(spriteRef.name, spriteRef);
    }
  }

  _addMember(memberRef) {
    this.#members.push(memberRef);
    if (memberRef && memberRef.name) {
      this.#membersByName.set(memberRef.name, memberRef);
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
    this.#sprites = [];
    this.#spritesByName = new Map();
    this.#members = [];
    this.#membersByName = new Map();
    this.#halted = false;
    this.#puppetSprites = new Map();
    this.#puppetTempo = null;
  }
}

export const _movie = new MovieRef();
