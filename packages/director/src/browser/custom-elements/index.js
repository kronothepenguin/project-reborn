// Custom elements: <x-object>, <x-embed>, <x-param>
// Replaces the legacy Shockwave <object>/<param>/<embed> embedding.

import { _setCanvas } from "../canvas.js";
import { startEventLoop, stopEventLoop } from "../event-loop.js";

let _registered = false;

class XObjectElement extends HTMLElement {
  static get observedAttributes() {
    return ["width", "height", "src", "tempo"];
  }

  #params = new Map();
  #movie = null;
  #castLibs = [];
  #canvas = null;
  #started = false;

  connectedCallback() {
    this.#collectChildParams();

    const src = this.getAttribute("src") ?? this.#params.get("src") ?? "";
    const tempo = Number(this.getAttribute("tempo") ?? this.#params.get("tempo") ?? 30);
    const width = Number(this.getAttribute("width") ?? 640);
    const height = Number(this.getAttribute("height") ?? 480);

    this.style.display = "inline-block";
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
    this.style.position = "relative";
    this.style.overflow = "hidden";

    this.#canvas = document.createElement("canvas");
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#canvas.style.display = "block";
    this.#canvas.style.width = "100%";
    this.#canvas.style.height = "100%";
    this.appendChild(this.#canvas);

    this.#movie = _createMovie({ src, tempo, width, height });
    _setCanvas(this.#canvas, this.#movie);

    this.#movie.dispatchEvent(new CustomEvent("prepareMovie", { detail: { src } }));

    if (src) {
      this.#loadMovieSrc(src).catch((err) => {
        console.error("[x-object] failed to load movie", err);
      });
    }

    this.#started = true;
    this.#movie.dispatchEvent(new CustomEvent("startMovie", { detail: { src } }));
    startEventLoop({ tempo, movie: this.#movie });
  }

  disconnectedCallback() {
    if (!this.#started) return;
    this.#movie?.dispatchEvent(new CustomEvent("stopMovie", { detail: {} }));
    stopEventLoop();
    this.#movie = null;
    this.#castLibs = [];
    this.#canvas = null;
    this.#started = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#started) return;
    if (name === "tempo" && this.#movie) {
      this.#movie.frameTempo = Number(newValue);
    }
  }

  get movie() {
    return this.#movie;
  }

  get castLibs() {
    return [...this.#castLibs];
  }

  #collectChildParams() {
    const children = this.querySelectorAll("x-param");
    children.forEach((child) => {
      const name = child.getAttribute("name");
      const value = child.getAttribute("value");
      if (name) {
        this.#params.set(name, value ?? "");
      }
    });
  }

  async #loadMovieSrc(src) {
    const { loadCast } = await import("../cast-loader.js");
    const cast = await loadCast(src);
    this.#castLibs.push(cast);
    this.#movie.dispatchEvent(
      new CustomEvent("castLoaded", { detail: { cast, src } })
    );
  }
}

class XEmbedElement extends HTMLElement {
  static get observedAttributes() {
    return ["width", "height", "src", "tempo", "type"];
  }

  #params = new Map();
  #movie = null;
  #castLibs = [];
  #canvas = null;
  #started = false;

  connectedCallback() {
    const src = this.getAttribute("src") ?? "";
    const tempo = Number(this.getAttribute("tempo") ?? 30);
    const width = Number(this.getAttribute("width") ?? 640);
    const height = Number(this.getAttribute("height") ?? 480);

    this.style.display = "inline-block";
    this.style.width = `${width}px`;
    this.style.height = `${height}px`;
    this.style.position = "relative";
    this.style.overflow = "hidden";

    this.#canvas = document.createElement("canvas");
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#canvas.style.display = "block";
    this.#canvas.style.width = "100%";
    this.#canvas.style.height = "100%";
    this.appendChild(this.#canvas);

    this.#movie = _createMovie({ src, tempo, width, height });
    _setCanvas(this.#canvas, this.#movie);

    this.#movie.dispatchEvent(new CustomEvent("prepareMovie", { detail: { src } }));

    if (src) {
      this.#loadMovieSrc(src).catch((err) => {
        console.error("[x-embed] failed to load movie", err);
      });
    }

    this.#started = true;
    this.#movie.dispatchEvent(new CustomEvent("startMovie", { detail: { src } }));
    startEventLoop({ tempo, movie: this.#movie });
  }

  disconnectedCallback() {
    if (!this.#started) return;
    this.#movie?.dispatchEvent(new CustomEvent("stopMovie", { detail: {} }));
    stopEventLoop();
    this.#movie = null;
    this.#castLibs = [];
    this.#canvas = null;
    this.#started = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue || !this.#started) return;
    if (name === "tempo" && this.#movie) {
      this.#movie.frameTempo = Number(newValue);
    }
  }

  get movie() {
    return this.#movie;
  }

  get castLibs() {
    return [...this.#castLibs];
  }

  async #loadMovieSrc(src) {
    const { loadCast } = await import("../cast-loader.js");
    const cast = await loadCast(src);
    this.#castLibs.push(cast);
    this.#movie.dispatchEvent(
      new CustomEvent("castLoaded", { detail: { cast, src } })
    );
  }
}

class XParamElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value"];
  }

  attributeChangedCallback(_name, _oldValue, _newValue) {
    const host = this.parentElement;
    if (!host || host.tagName.toLowerCase() !== "x-object") {
      return;
    }
    const name = this.getAttribute("name");
    const value = this.getAttribute("value");
    if (name) {
      const detail = { name, value: value ?? "" };
      host.dispatchEvent(new CustomEvent("xparam", { detail }));
    }
  }
}

export function _createMovie({ src = "", tempo = 30, width = 640, height = 480 } = {}) {
  return {
    src,
    width,
    height,
    tempo,
    frame: 1,
    frameTempo: tempo,
    sprites: [],
    members: [],
    castLibs: [],
    _listeners: new Map(),
    addEventListener(type, listener) {
      const list = this._listeners.get(type) ?? [];
      list.push(listener);
      this._listeners.set(type, list);
    },
    removeEventListener(type, listener) {
      const list = this._listeners.get(type);
      if (!list) return;
      const idx = list.indexOf(listener);
      if (idx !== -1) list.splice(idx, 1);
    },
    dispatchEvent(event) {
      const list = this._listeners.get(event.type);
      if (list) {
        for (const fn of list) fn(event);
      }
      return true;
    },
  };
}

export function registerCustomElements() {
  if (_registered) return;
  if (typeof globalThis.customElements === "undefined") return;
  if (!customElements.get("x-object")) {
    customElements.define("x-object", XObjectElement);
  }
  if (!customElements.get("x-embed")) {
    customElements.define("x-embed", XEmbedElement);
  }
  if (!customElements.get("x-param")) {
    customElements.define("x-param", XParamElement);
  }
  _registered = true;
}

// Auto-register on import only when HTMLElement is available (browser).
// In non-DOM environments (Node, jsdom-less test runners) skip registration
// so importing this module doesn't throw on `class XObjectElement extends HTMLElement`.
if (typeof globalThis.HTMLElement !== "undefined" && typeof globalThis.customElements !== "undefined") {
  registerCustomElements();
}
