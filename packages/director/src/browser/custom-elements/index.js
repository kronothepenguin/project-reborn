// Custom elements: <x-object>, <x-embed>, <x-param> (009).
//
// Thin layers over 008's imperative `run()` — no runtime of their own:
//   <x-embed src="…/habbo/index.js">
//     <x-param name="sw1" value="1">
//   </x-embed>
// reads src/data + width/height (+ tempo), inserts a <canvas>, snapshots the
// <x-param>s into externalParams, calls run(src, { canvas, externalParams }),
// relays handle events (externalEvent/error/gotoNetMovie/gotoNetPage/paint)
// onto the element, forwards input (stage-translated), and destroys on
// disconnect. Element ≡ imperative handle (SC-010).

import { run } from "../../player/run.js";

const STAGE_DEFAULTS = { width: 640, height: 480, tempo: 30 };

const RELAY_EVENTS = ["externalEvent", "error", "gotoNetMovie", "gotoNetPage"];

const INPUT_EVENTS = [
  "keydown", "keyup", "mousedown", "mouseup", "mousemove", "focus", "blur",
];

let _registered = false;

function stageSize(el) {
  const width = Number(el.getAttribute("width"));
  const height = Number(el.getAttribute("height"));
  return {
    width: Number.isFinite(width) && width > 0 ? width : STAGE_DEFAULTS.width,
    height: Number.isFinite(height) && height > 0 ? height : STAGE_DEFAULTS.height,
  };
}

function srcOf(el) {
  return el.getAttribute("src") ?? el.getAttribute("data") ?? "";
}

function tempoOf(el) {
  const tempo = Number(el.getAttribute("tempo"));
  return Number.isFinite(tempo) && tempo > 0 ? tempo : null;
}

// element-relative client coords → stage-space pixels (scale by stage/el size;
// the worker y-flips per Director's bottom-left origin).
function toStagePoint(el, e, stage) {
  const rect = el.getBoundingClientRect();
  const sx = rect.width > 0 ? stage.width / rect.width : 1;
  const sy = rect.height > 0 ? stage.height / rect.height : 1;
  return {
    clientX: Math.trunc((e.clientX - rect.left) * sx),
    clientY: Math.trunc((e.clientY - rect.top) * sy),
  };
}

class XEmbedBaseElement extends HTMLElement {
  static get observedAttributes() {
    return ["src", "data", "width", "height", "tempo"];
  }

  constructor() {
    super();
    this._handle = null;
    this._canvas = null;
    this._params = [];
    this._frame = 0;
    this._connected = false;
    this._boundInput = (e) => this._forwardInput(e);
  }

  connectedCallback() {
    if (this._connected) return;
    const src = srcOf(this);
    if (!src) return;

    const stage = stageSize(this);
    this.style.display = "inline-block";
    this.style.width = `${stage.width}px`;
    this.style.height = `${stage.height}px`;
    this.style.position = "relative";
    this.style.overflow = "hidden";

    this._canvas = document.createElement("canvas");
    this._canvas.width = stage.width;
    this._canvas.height = stage.height;
    this._canvas.style.display = "block";
    this._canvas.style.width = "100%";
    this._canvas.style.height = "100%";
    this.appendChild(this._canvas);

    this._params = this.#collectParams(); // C2: snapshot at connect (stale later)

    const handle = run(src, { canvas: this._canvas, externalParams: this._params });
    this._handle = handle;

    for (const type of RELAY_EVENTS) {
      handle.addEventListener(type, (e) => {
        this.dispatchEvent(new CustomEvent(type, { detail: e.detail }));
      });
    }
    handle.addEventListener("paint", (e) => this.#paint(e.detail));
    handle.addEventListener("ready", () => {
      const tempo = tempoOf(this);
      if (tempo !== null) {
        handle.post("setTempo", { tempo });
      }
      handle.start();
    }, { once: true });

    for (const kind of INPUT_EVENTS) {
      this.addEventListener(kind, this._boundInput);
    }

    this._connected = true;
  }

  disconnectedCallback() {
    if (!this._connected) return;
    this._connected = false;
    for (const kind of INPUT_EVENTS) {
      this.removeEventListener(kind, this._boundInput);
    }
    this._handle?.destroy();
    this._handle = null;
    this._canvas = null;
  }

  _forwardInput(e) {
    const handle = this._handle;
    if (!handle || handle.destroyed) return;
    const kind = e.type;
    const payload = { kind };
    if (kind === "keydown" || kind === "keyup") {
      payload.key = e.key ?? "";
      payload.keyCode = e.keyCode ?? e.which ?? 0;
    } else if (kind === "mousedown" || kind === "mouseup" || kind === "mousemove") {
      const p = toStagePoint(this, e, stageSize(this));
      payload.clientX = p.clientX;
      payload.clientY = p.clientY;
      if (kind === "mousedown" || kind === "mouseup") payload.button = e.button ?? 0;
    }
    handle.post(kind, payload);
  }

  async #paint(detail) {
    const canvas = this._canvas;
    if (!canvas || !detail?.imageData) return;
    this._frame = detail.seq ?? this._frame;
    const ctx2d = canvas.getContext && canvas.getContext("2d");
    if (!ctx2d) return;
    try {
      ctx2d.putImageData(detail.imageData, 0, 0);
    } catch {
      // stale/detached imageData — drop
    }
  }

  #collectParams() {
    return Array.from(this.querySelectorAll("x-param"))
      .map((child) => ({
        name: child.getAttribute("name") ?? "",
        value: child.getAttribute("value") ?? "",
      }))
      .filter((p) => p.name.length > 0);
  }

  get handle() {
    return this._handle;
  }

  get movieName() {
    return srcOf(this);
  }

  get frame() {
    return this._frame;
  }
}

class XEmbedElement extends XEmbedBaseElement {}
class XObjectElement extends XEmbedBaseElement {}

class XParamElement extends HTMLElement {
  static get observedAttributes() {
    return ["name", "value"];
  }
}

export function registerCustomElements() {
  if (_registered) return;
  if (typeof globalThis.customElements === "undefined") return;
  if (!customElements.get("x-object")) customElements.define("x-object", XObjectElement);
  if (!customElements.get("x-embed")) customElements.define("x-embed", XEmbedElement);
  if (!customElements.get("x-param")) customElements.define("x-param", XParamElement);
  _registered = true;
}

// Auto-register on import when a DOM with customElements exists (browser/jsdom).
if (
  typeof globalThis.HTMLElement !== "undefined" &&
  typeof globalThis.customElements !== "undefined"
) {
  registerCustomElements();
}