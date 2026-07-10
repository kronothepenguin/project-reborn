import { Rect, rect } from "./rect.js";

export class WindowObject {
  #name = "";
  #title = "";
  #fileName = "";
  #movie = null;
  #rectValue = rect(0, 0, 640, 480);
  #sourceRect = rect(0, 0, 640, 480);
  #drawRect = rect(0, 0, 640, 480);
  #bgColor = 0;
  #visible = true;
  #resizable = true;
  #type = 1;
  #sizeState = 0;
  #appearanceOptions = 0;
  #titlebarOptions = 0;
  #image = null;
  #picture = null;
  #dockingEnabled = true;
  #windowBehind = null;
  #windowInFront = null;

  constructor(name = "") {
    this.#name = String(name ?? "");
    WindowObject._register(this);
  }

  get name() {
    return this.#name;
  }

  set name(value) {
    this.#name = String(value ?? "");
  }

  get title() {
    return this.#title;
  }

  set title(value) {
    this.#title = String(value ?? "");
  }

  get fileName() {
    return this.#fileName;
  }

  set fileName(value) {
    this.#fileName = String(value ?? "");
  }

  get movie() {
    return this.#movie;
  }

  set movie(value) {
    this.#movie = value ?? null;
  }

  get rect() {
    return this.#rectValue;
  }

  set rect(value) {
    if (value instanceof Rect) {
      this.#rectValue = value;
    }
  }

  get sourceRect() {
    return this.#sourceRect;
  }

  set sourceRect(value) {
    if (value instanceof Rect) {
      this.#sourceRect = value;
    }
  }

  get drawRect() {
    return this.#drawRect;
  }

  set drawRect(value) {
    if (value instanceof Rect) {
      this.#drawRect = value;
    }
  }

  get bgColor() {
    return this.#bgColor;
  }

  set bgColor(value) {
    this.#bgColor = Number(value) || 0;
  }

  get visible() {
    return this.#visible;
  }

  set visible(value) {
    this.#visible = Boolean(value);
  }

  get resizable() {
    return this.#resizable;
  }

  set resizable(value) {
    this.#resizable = Boolean(value);
  }

  get type() {
    return this.#type;
  }

  set type(value) {
    this.#type = Number(value) || 1;
  }

  get sizeState() {
    return this.#sizeState;
  }

  set sizeState(value) {
    this.#sizeState = Number(value);
  }

  get appearanceOptions() {
    return this.#appearanceOptions;
  }

  set appearanceOptions(value) {
    this.#appearanceOptions = Number(value);
  }

  get titlebarOptions() {
    return this.#titlebarOptions;
  }

  set titlebarOptions(value) {
    this.#titlebarOptions = Number(value);
  }

  get image() {
    return this.#image;
  }

  set image(value) {
    this.#image = value ?? null;
  }

  get picture() {
    return this.#picture;
  }

  set picture(value) {
    this.#picture = value ?? null;
  }

  get dockingEnabled() {
    return this.#dockingEnabled;
  }

  set dockingEnabled(value) {
    this.#dockingEnabled = Boolean(value);
  }

  get windowBehind() {
    return this.#windowBehind;
  }

  set windowBehind(value) {
    this.#windowBehind = value ?? null;
  }

  get windowInFront() {
    return this.#windowInFront;
  }

  set windowInFront(value) {
    this.#windowInFront = value ?? null;
  }

  open() {
    this.#visible = true;
    return true;
  }

  close() {
    this.#visible = false;
    return true;
  }

  forget() {
    WindowObject._unregister(this);
    return true;
  }

  maximize() {
    this.#sizeState = 2;
    return true;
  }

  minimize() {
    this.#sizeState = 1;
    return true;
  }

  restore() {
    this.#sizeState = 0;
    return true;
  }

  moveToFront() {
    WindowObject._bringToFront(this);
    return true;
  }

  moveToBack() {
    WindowObject._sendToBack(this);
    return true;
  }

  mergeProps(_propList) {
    return true;
  }

  static #windows = [];
  static #windowsByName = new Map();

  static get windowList() {
    return WindowObject.#windows.slice();
  }

  static window = new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === "symbol") return undefined;
      return WindowObject.#windowsByName.get(prop) ?? null;
    },
    set: () => {
      throw new Error("window is read-only");
    },
    has: (_target, prop) => {
      if (typeof prop === "symbol") return false;
      return WindowObject.#windowsByName.has(prop);
    },
    ownKeys: () => WindowObject.#windows.map((w) => w.name),
    getOwnPropertyDescriptor: (_target, prop) => {
      const w = WindowObject.#windowsByName.get(prop);
      if (!w) return undefined;
      return { configurable: true, enumerable: true, value: w };
    },
  });

  static _register(win) {
    if (!win) return;
    WindowObject.#windows.push(win);
    if (win.name) {
      WindowObject.#windowsByName.set(win.name, win);
    }
  }

  static _unregister(win) {
    const idx = WindowObject.#windows.indexOf(win);
    if (idx !== -1) {
      WindowObject.#windows.splice(idx, 1);
    }
    if (win && win.name) {
      WindowObject.#windowsByName.delete(win.name);
    }
  }

  static _bringToFront(win) {
    const idx = WindowObject.#windows.indexOf(win);
    if (idx !== -1) {
      WindowObject.#windows.splice(idx, 1);
      WindowObject.#windows.push(win);
    }
  }

  static _sendToBack(win) {
    const idx = WindowObject.#windows.indexOf(win);
    if (idx !== -1) {
      WindowObject.#windows.splice(idx, 1);
      WindowObject.#windows.unshift(win);
    }
  }

  static _reset() {
    WindowObject.#windows = [];
    WindowObject.#windowsByName = new Map();
  }
}
