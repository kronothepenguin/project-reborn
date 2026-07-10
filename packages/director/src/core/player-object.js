import { _sound } from "./sound-object.js";
import { WindowObject } from "./window-object.js";

const PREF_PREFIX = "director_pref_";

export class PlayerObject {
  #alertHook = null;
  #currentCursor = 0;
  #debugPlaybackEnabled = false;
  #editShortcutsEnabled = false;
  #exitLock = false;
  #parameters = {};
  #xtras = [];
  #activeCastLib = 1;
  #activeWindow = null;
  #applicationName = "";
  #applicationPath = "";
  #currentSpriteNum = 0;
  #digitalVideoTimeScale = 1;
  #disableImagingTransformation = false;
  #emulateMultibuttonMouse = false;
  #externalParamCount = 0;
  #frontWindow = null;
  #inlineImeEnabled = false;
  #lastClick = 0;
  #lastEvent = "";
  #lastKey = 0;
  #lastRoll = 0;
  #mediaXtraList = [];
  #netPresent = false;
  #netThrottleTicks = 0;
  #organizationName = "";
  #productName = "Director";
  #productVersion = "MX 2004";
  #safePlayer = true;
  #scriptingXtraList = [];
  #searchCurrentFolder = "";
  #searchPathList = [];
  #serialNumber = "";
  #switchColorDepth = 0;
  #toolXtraList = [];
  #transitionXtraList = [];
  #userName = "";

  constructor() {
    this.sound = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          return undefined;
        }
        return undefined;
      },
      has: (_target, prop) => {
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          return false;
        }
        return false;
      },
    });

    this.xtra = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          const idx = Number(prop);
          if (idx >= 1 && idx <= this.#xtras.length) {
            return this.#xtras[idx - 1];
          }
          return undefined;
        }
        if (typeof prop === "string") {
          return this.#xtras.find((x) => x.name === prop) ?? undefined;
        }
        return undefined;
      },
      has: (_target, prop) => {
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          const idx = Number(prop);
          return idx >= 1 && idx <= this.#xtras.length;
        }
        if (typeof prop === "string") {
          return this.#xtras.some((x) => x.name === prop);
        }
        return false;
      },
      set: () => {
        throw new Error("xtra is read-only");
      },
    });

    this.window = new Proxy(Object.create(null), {
      get: (_target, prop) => {
        if (typeof prop === "symbol") return undefined;
        return WindowObject.window[prop] ?? null;
      },
      has: (_target, prop) => {
        if (typeof prop === "symbol") return false;
        return prop in WindowObject.window;
      },
      ownKeys: () => Reflect.ownKeys(WindowObject.window),
      getOwnPropertyDescriptor: (_target, prop) =>
        Object.getOwnPropertyDescriptor(WindowObject.window, prop),
    });

    this.windowList = new Proxy([], {
      get: (_target, prop) => {
        if (prop === "length") return WindowObject.windowList.length;
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          return WindowObject.windowList[Number(prop) - 1] ?? null;
        }
        return undefined;
      },
      has: (_target, prop) => {
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          return Number(prop) >= 1 && Number(prop) <= WindowObject.windowList.length;
        }
        return false;
      },
      ownKeys: () => WindowObject.windowList.map((_, i) => String(i + 1)),
      getOwnPropertyDescriptor: (_target, prop) => {
        if (typeof prop === "string" && /^\d+$/.test(prop)) {
          const idx = Number(prop) - 1;
          if (idx >= 0 && idx < WindowObject.windowList.length) {
            return { configurable: true, enumerable: true, value: WindowObject.windowList[idx] };
          }
        }
        return undefined;
      },
    });
  }

  get runMode() {
    return "Plugin";
  }

  get xtraList() {
    return this.#xtras.map((x) => ({
      filename: x.filename,
      version: x.version,
    }));
  }

  get alertHook() {
    return this.#alertHook;
  }

  set alertHook(value) {
    this.#alertHook = value;
  }

  get debugPlaybackEnabled() {
    return this.#debugPlaybackEnabled;
  }

  set debugPlaybackEnabled(value) {
    this.#debugPlaybackEnabled = Boolean(value);
  }

  get editShortcutsEnabled() {
    return this.#editShortcutsEnabled;
  }

  set editShortcutsEnabled(value) {
    this.#editShortcutsEnabled = Boolean(value);
  }

  get exitLock() {
    return this.#exitLock;
  }

  set exitLock(value) {
    this.#exitLock = Boolean(value);
  }

  get parameters() {
    return this.#parameters;
  }

  set parameters(value) {
    this.#parameters = value;
  }

  get activeCastLib() {
    return this.#activeCastLib;
  }

  set activeCastLib(value) {
    this.#activeCastLib = Number(value) || 0;
  }

  get activeWindow() {
    return this.#activeWindow;
  }

  set activeWindow(value) {
    this.#activeWindow = value ?? null;
  }

  get applicationName() {
    return this.#applicationName;
  }

  set applicationName(value) {
    this.#applicationName = String(value ?? "");
  }

  get applicationPath() {
    return this.#applicationPath;
  }

  set applicationPath(value) {
    this.#applicationPath = String(value ?? "");
  }

  get currentSpriteNum() {
    return this.#currentSpriteNum;
  }

  set currentSpriteNum(value) {
    this.#currentSpriteNum = Number(value) || 0;
  }

  get digitalVideoTimeScale() {
    return this.#digitalVideoTimeScale;
  }

  set digitalVideoTimeScale(value) {
    this.#digitalVideoTimeScale = Number(value) || 1;
  }

  get disableImagingTransformation() {
    return this.#disableImagingTransformation;
  }

  set disableImagingTransformation(value) {
    this.#disableImagingTransformation = Boolean(value);
  }

  get emulateMultibuttonMouse() {
    return this.#emulateMultibuttonMouse;
  }

  set emulateMultibuttonMouse(value) {
    this.#emulateMultibuttonMouse = Boolean(value);
  }

  get externalParamCount() {
    if (this.#parameters && typeof this.#parameters === "object") {
      return Object.keys(this.#parameters).length;
    }
    return 0;
  }

  get frontWindow() {
    return WindowObject.windowList[WindowObject.windowList.length - 1] ?? null;
  }

  set frontWindow(value) {
    this.#frontWindow = value ?? null;
  }

  get inlineImeEnabled() {
    return this.#inlineImeEnabled;
  }

  set inlineImeEnabled(value) {
    this.#inlineImeEnabled = Boolean(value);
  }

  get lastClick() {
    return this.#lastClick;
  }

  set lastClick(_value) {
    throw new Error("lastClick is read-only");
  }

  get lastEvent() {
    return this.#lastEvent;
  }

  set lastEvent(_value) {
    throw new Error("lastEvent is read-only");
  }

  get lastKey() {
    return this.#lastKey;
  }

  set lastKey(_value) {
    throw new Error("lastKey is read-only");
  }

  get lastRoll() {
    return this.#lastRoll;
  }

  set lastRoll(_value) {
    throw new Error("lastRoll is read-only");
  }

  get mediaXtraList() {
    return this.#mediaXtraList;
  }

  set mediaXtraList(_value) {
    throw new Error("mediaXtraList is read-only");
  }

  get netPresent() {
    return this.#netPresent;
  }

  set netPresent(value) {
    this.#netPresent = Boolean(value);
  }

  get netThrottleTicks() {
    return this.#netThrottleTicks;
  }

  set netThrottleTicks(value) {
    this.#netThrottleTicks = Number(value) || 0;
  }

  get organizationName() {
    return this.#organizationName;
  }

  set organizationName(value) {
    this.#organizationName = String(value ?? "");
  }

  get productName() {
    return this.#productName;
  }

  set productName(value) {
    this.#productName = String(value ?? "");
  }

  get productVersion() {
    return this.#productVersion;
  }

  set productVersion(value) {
    this.#productVersion = String(value ?? "");
  }

  get safePlayer() {
    return this.#safePlayer;
  }

  set safePlayer(value) {
    this.#safePlayer = Boolean(value);
  }

  get scriptingXtraList() {
    return this.#scriptingXtraList;
  }

  set scriptingXtraList(_value) {
    throw new Error("scriptingXtraList is read-only");
  }

  get searchCurrentFolder() {
    return this.#searchCurrentFolder;
  }

  set searchCurrentFolder(value) {
    this.#searchCurrentFolder = String(value ?? "");
  }

  get searchPathList() {
    return this.#searchPathList;
  }

  set searchPathList(value) {
    this.#searchPathList = Array.isArray(value) ? value : [];
  }

  get serialNumber() {
    return this.#serialNumber;
  }

  set serialNumber(value) {
    this.#serialNumber = String(value ?? "");
  }

  get switchColorDepth() {
    return this.#switchColorDepth;
  }

  set switchColorDepth(value) {
    this.#switchColorDepth = Number(value) || 0;
  }

  get toolXtraList() {
    return this.#toolXtraList;
  }

  set toolXtraList(_value) {
    throw new Error("toolXtraList is read-only");
  }

  get transitionXtraList() {
    return this.#transitionXtraList;
  }

  set transitionXtraList(_value) {
    throw new Error("transitionXtraList is read-only");
  }

  get userName() {
    return this.#userName;
  }

  set userName(value) {
    this.#userName = String(value ?? "");
  }

  externalParamValue(name) {
    if (this.#parameters && typeof this.#parameters === "object" && name in this.#parameters) {
      return this.#parameters[name];
    }
    if (typeof globalThis.URLSearchParams !== "undefined" && typeof globalThis.location !== "undefined") {
      try {
        const params = new URLSearchParams(globalThis.location.search);
        if (params.has(name)) {
          return params.get(name);
        }
      } catch {
        // no location available
      }
    }
    return undefined;
  }

  getPref(name) {
    try {
      const value = globalThis.localStorage?.getItem(PREF_PREFIX + name);
      if (value === null) return undefined;
      return value;
    } catch {
      return undefined;
    }
  }

  setPref(name, value) {
    try {
      globalThis.localStorage?.setItem(PREF_PREFIX + name, String(value));
    } catch {
      // storage unavailable
    }
  }

  quit() {
    if (typeof globalThis.close === "function") {
      globalThis.close();
    }
  }

  halt() {
    return true;
  }

  open(_movie) {
    return true;
  }

  windowPresent(_window) {
    return true;
  }

  alert(displayString) {
    const text = String(displayString ?? "").slice(0, 255);
    if (typeof this.#alertHook === "function") {
      this.#alertHook(text);
      return;
    }
    if (typeof globalThis.alert === "function") {
      globalThis.alert(text);
    }
  }

  appMinimize() {
    if (typeof globalThis.document !== "undefined" && typeof globalThis.document.hidden !== "undefined") {
      return;
    }
  }

  cursor(arg1, arg2) {
    if (typeof arg1 === "number") {
      this.#currentCursor = arg1;
    } else if (typeof arg1 === "object" && arg1 !== null) {
      this.#currentCursor = arg1;
    } else if (typeof arg1 === "string") {
      this.#currentCursor = { memNum: Number(arg1) || 0, maskNum: Number(arg2) || 0 };
    }
  }

  get currentCursor() {
    return this.#currentCursor;
  }

  externalParamName(paramNameOrNum) {
    if (this.#parameters && typeof this.#parameters === "object") {
      const keys = Object.keys(this.#parameters);
      if (typeof paramNameOrNum === "string") {
        const match = keys.find((k) => k.toLowerCase() === paramNameOrNum.toLowerCase());
        return match ?? null;
      }
      if (typeof paramNameOrNum === "number") {
        return keys[paramNameOrNum - 1] ?? null;
      }
    }
    return null;
  }

  flushInputEvents() {
  }
}

export const _player = new PlayerObject();
