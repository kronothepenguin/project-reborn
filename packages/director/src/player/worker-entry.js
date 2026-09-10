// Worker entry (009) — the real-worker bootstrap behind `run(bundleUrl)`.
//
// The generated bundle (a C8 movie pack) is PURE DATA: its default export is
// the movie definition. This module is the worker entrypoint `run()` points a
// dedicated Worker at; it receives `init`, bootstraps the runtime, and then
// serves the 001 protocol:
//
//   MT → W : init {bundleUrl?|definition, externalParams, offscreenCanvas?}
//            start | stop | destroy | goToFrame{n} | poll-lifecycle
//            input {kind: keydown|keyup|mousedown|mouseup|mousemove|focus|blur}
//   W → MT : ready | error{message} | lifecycle{...}
//            externalEvent{name,args} | gotoNetMovie{url} | gotoNetPage{url}
//            paint{imageData,width,height,seq}   (no OffscreenCanvas fallback)
//
// Boot order (008 C7 + 001 imperative-runtime contract):
//   installGlobals(self) → import(bundleUrl).default → ingestDefinition(ctx)
//   → renderer (offscreen | paint) → audio (if AudioContext present)
//   → attach ctx → post ready.
// Then `start` runs the tempo-driven loop (event-loop.js), one movie per worker.

import { installGlobals } from "./worker-shim.js";
import { DirectorContext } from "../engine/subsystem/context.js";
import { ingestDefinition } from "./ingest.js";
import { createRenderer } from "./renderer.js";
import { createAudioEngine } from "./audio.js";
import { handleInputMessage } from "./input.js";
import { startEventLoop, stopEventLoop, setTempo } from "./event-loop.js";
import { _setExternalEventPost } from "./external-event.js";

const INPUT_KINDS = new Set([
  "keydown", "keyup", "mousedown", "mouseup", "mousemove", "focus", "blur",
]);

export function createWorkerEntry({ post = (msg) => self.postMessage(msg), sandbox = self } = {}) {
  let ctx = null;
  let renderer = null;
  let audio = null;
  let started = false;
  let running = false;
  const images = new Map();

  function send(msg) {
    post(msg);
  }

  async function init(data) {
    try {
      installGlobals(sandbox);
      ctx = new DirectorContext({ externalParams: data.externalParams ?? [] });

      let definition;
      if (typeof data.bundleUrl === "string" && data.bundleUrl.length > 0) {
        const mod = await import(/* @vite-ignore */ data.bundleUrl);
        definition = mod.default ?? mod;
      } else {
        definition = data.definition;
      }
      ingestDefinition(ctx, definition);

      // Renderer: OffscreenCanvas primary (transfer path), paint fallback.
      if (data.offscreenCanvas && typeof data.offscreenCanvas.getContext === "function") {
        const dctx = data.offscreenCanvas.getContext("2d");
        renderer = createRenderer({ mode: "offscreen", width: ctx.width, height: ctx.height });
        renderer._drawContext = dctx;
        renderer._resolveImage = (memberName) => images.get(memberName) ?? null;
        warmImages(ctx, images);
      } else {
        renderer = createRenderer({
          mode: "paint",
          onPaint: (msg) => send(msg),
          width: ctx.width,
          height: ctx.height,
        });
      }

      // Audio: AudioContext is unreliable in workers; when present, wire the
      // 8-channel engine, else channels stay inert (renderer unaffected).
      if (typeof AudioContext !== "undefined") {
        try {
          ctx.audioContext = new AudioContext();
          audio = createAudioEngine(ctx.audioContext);
        } catch {
          ctx.audioContext = null;
          audio = null;
        }
      }

      // Worker → host tagged posts (externalEvent + net relay drains).
      _setExternalEventPost((msg) => send(msg));

      started = true;
      send({ kind: "ready", detail: { name: ctx.movie?.name || ctx.name } });
    } catch (err) {
      send({ kind: "error", detail: { message: err?.message ?? String(err) } });
    }
  }

  function start() {
    if (!started || !ctx || running) return;
    running = true;
    ctx.prepareMovie();
    ctx.startMovie();
    startEventLoop({
      tempo: ctx.tempo,
      movie: ctx,
      onFrame: (c) => {
        if (renderer) renderer.renderFrame(c);
        audio?.channels?.forEach?.((ch) => ch.tick?.());
      },
    });
  }

  function stop() {
    if (!running) return;
    running = false;
    stopEventLoop();
  }

  function destroy() {
    stop();
    if (ctx) {
      ctx.stopMovie();
      ctx.destroy();
    }
    ctx = null;
    renderer = null;
    audio = null;
    started = false;
  }

  function goToFrame(n) {
    if (!ctx || !ctx.score) return;
    ctx.score.go(n);
  }

  function pollLifecycle() {
    send({
      kind: "lifecycle",
      detail: {
        frame: ctx?.score?.frame ?? 0,
        channels: ctx?.score?.populatedChannels?.() ?? [],
        running,
      },
    });
  }

  function onMessage(e) {
    const { kind } = e?.data ?? {};
    if (!kind) return;
    if (kind === "init") { init(e.data); return; }
    if (kind === "start") { start(); return; }
    if (kind === "stop") { stop(); return; }
    if (kind === "destroy") { destroy(); return; }
    if (kind === "goToFrame") { goToFrame(e.data?.n); return; }
    if (kind === "poll-lifecycle") { pollLifecycle(); return; }
    if (kind === "setTempo") {
      const t = Math.max(1, Number(e.data?.tempo) || ctx?.tempo || 30);
      if (ctx) ctx.tempo = t;
      setTempo(t);
      return;
    }
    if (INPUT_KINDS.has(kind)) { if (ctx) handleInputMessage(ctx, e.data); return; }
  }

  return {
    init, start, stop, destroy, goToFrame, pollLifecycle, onMessage,
    get context() { return ctx; },
    get renderer() { return renderer; },
    get running() { return running; },
  };
}

// Preload member bitmaps (inline base64 data URIs) → drawable ImageBitmaps,
// so later frames draw content on the OffscreenCanvas. Synchronous lookup
// returns whatever is ready; missing/mid-load media is skipped that frame.
function warmImages(ctx, images) {
  if (typeof fetch !== "function" || typeof createImageBitmap !== "function") return;
  const seen = new Set();
  for (const lib of ctx.memberRegistry?.byNameInCastLib?.values?.() ?? []) {
    for (const member of lib.values()) {
      const name = member?.name;
      if (!name || seen.has(name)) continue;
      seen.add(name);
      const uri = member?.payload?.data;
      if (typeof uri !== "string" || uri.length === 0) continue;
      fetch(uri)
        .then((r) => r.blob())
        .then((blob) => createImageBitmap(blob))
        .then((bmp) => images.set(name, bmp))
        .catch(() => images.set(name, null));
    }
  }
}

export function installWorkerBootstrap(self) {
  const entry = createWorkerEntry({ post: (msg) => self.postMessage(msg) });
  self.onmessage = (e) => entry.onMessage(e);
  return entry;
}

// Auto-bootstrap only inside a real dedicated/module Web Worker (browser).
if (
  typeof self !== "undefined" &&
  typeof WorkerGlobalScope !== "undefined" &&
  self instanceof WorkerGlobalScope
) {
  installWorkerBootstrap(self);
}
