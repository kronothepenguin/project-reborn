import { _sound } from "./sound-ref.js";

const PREF_PREFIX = "director_pref_";

export class PlayerRef {
  #alertHook = null;
  #debugPlaybackEnabled = false;
  #editShortcutsEnabled = false;
  #exitLock = false;
  #parameters = {};
  #xtras = [];

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
}

export const _player = new PlayerRef();
