// run() — the runner-core entry (008 R7 / US1).
//
// `run(input, { canvas, externalParams })`:
//   - input is the bundle URL (string; C7) — the worker imports it and its
//     default export is the movie definition.
//   - spawns a Worker (the main thread creates and owns it), posts `init`,
//     waits for `ready`, and returns a `MainThreadImperativeHandle`.
//   - inline MovieDefinition (object) accepted for tests: the definition is
//     forwarded verbatim (no bundle import needed).
//
// Follows the 001 imperative-runtime.md protocol table: init → ready →
// start/stop/destroy/goToFrame/poll-lifecycle; W→MT externalEvent/error/
// gotoNetMovie/gotoNetPage relayed to the handle.

import { WorkerHost } from "./worker-host.js";

export function run(input, { canvas = null, externalParams = [] } = {}) {
  return new MainThreadImperativeHandle(input, { canvas, externalParams });
}

export class MainThreadImperativeHandle extends EventTarget {
  constructor(input, { canvas, externalParams }) {
    super();
    this.destroyed = false;
    this.ready = false;
    this._input = input;
    this._canvas = canvas ?? null;
    this._externalParams = Array.isArray(externalParams) ? externalParams : [];
    this._worker = null;
    this._pendingInit = null;

    this._spawn();
  }

  _spawn() {
    const isUrl = typeof this._input === "string";
    const workerUrl = isUrl ? this._input : "data:text/javascript;base64," + btoa("self.onmessage=()=>{}");

    // The host creates the Worker; the worker's own source is the bundle when
    // a URL is given (the worker imports it), else a stub that accepts the
    // inline definition via the init message.
    this._worker = new Worker(workerUrl, { type: "module", name: "director-movie" });
    this._worker.addEventListener("message", (e) => this._onMessage(e));

    const initMsg = {
      kind: "init",
      externalParams: this._externalParams,
    };
    if (isUrl) {
      initMsg.bundleUrl = this._input;
    } else {
      initMsg.definition = this._input;
    }
    if (this._canvas && typeof this._canvas.transferControlToOffscreen === "function") {
      try {
        const offscreen = this._canvas.transferControlToOffscreen();
        initMsg.offscreenCanvas = offscreen;
      } catch {
        // no transferable canvas — worker falls back to paint messages
      }
    }

    this._worker.postMessage(initMsg);
    this._pendingInit = initMsg;
  }

  _onMessage(e) {
    const { kind, detail } = e.data ?? {};
    if (kind === "ready") {
      this.ready = true;
      this.dispatchEvent(new CustomEvent("ready", { detail }));
      return;
    }
    if (kind === "externalEvent") {
      this.dispatchEvent(new CustomEvent("externalEvent", { detail: { name: detail?.name, args: detail?.args } }));
      return;
    }
    if (kind === "error") {
      this.dispatchEvent(new CustomEvent("error", { detail: { message: detail?.message } }));
      return;
    }
    if (kind === "gotoNetMovie" || kind === "gotoNetPage") {
      this.dispatchEvent(new CustomEvent(kind, { detail }));
    }
  }

  post(kind, payload = {}) {
    if (this.destroyed) return;
    this._worker?.postMessage({ kind, ...payload });
  }

  start() {
    if (!this.ready) {
      this.addEventListener("ready", () => this.post("start"), { once: true });
      return;
    }
    this.post("start");
  }

  stop() {
    this.post("stop");
  }

  goToFrame(n) {
    this.post("goToFrame", { n });
  }

  poll() {
    this.post("poll-lifecycle");
  }

  destroy() {
    if (this.destroyed) return;
    this.post("destroy");
    this.destroyed = true;
    this.ready = false;
    if (this._worker) {
      this._worker.terminate();
      this._worker = null;
    }
    this.dispatchEvent(new CustomEvent("stopMovie", { detail: {} }));
  }
}