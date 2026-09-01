// Mount helper — attach a DirectorContext's movie to a host DOM element and
// wire up the canvas + event loop. The custom-elements layer
// (`runtime/player/custom-elements/index.js`) handles the higher-level
// `<x-object>` flow; this is a lower-level "give me a canvas now" helper for
// consumers that aren't using custom elements (e.g. embedding into an existing
// container, headless tests that need a canvas ref).
//
// Returns the created canvas so the caller can keep a handle to it.

import { _setCanvas } from "./canvas.js";
import { startEventLoop, stopEventLoop } from "./event-loop.js";

const EVENT_LOOP_HANDLE = { stop: stopEventLoop };

export function mount(ctx, hostElement, options = {}) {
  if (!ctx || ctx.destroyed) throw new Error("mount: ctx is not active or already destroyed");
  if (!hostElement) throw new Error("mount: hostElement is required");

  const width = options.width ?? ctx.width ?? 640;
  const height = options.height ?? ctx.height ?? 480;
  const tempo = options.tempo ?? ctx.tempo ?? 30;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.style.display = "block";
  canvas.style.width = options.cssWidth ?? "100%";
  canvas.style.height = options.cssHeight ?? "100%";
  hostElement.appendChild(canvas);

  ctx.canvas = canvas;
  _setCanvas(canvas, ctx.movie);

  ctx.movie.dispatchEvent(new CustomEvent("prepareMovie", { detail: { src: ctx.src } }));
  startEventLoop({ tempo, movie: ctx.movie });
  ctx.eventLoopHandle = EVENT_LOOP_HANDLE;
  ctx.movie.dispatchEvent(new CustomEvent("startMovie", { detail: { src: ctx.src } }));

  return canvas;
}

export function unmount(ctx) {
  if (!ctx) return;
  if (ctx.eventLoopHandle) {
    ctx.eventLoopHandle.stop?.();
    ctx.eventLoopHandle = null;
  }
  if (ctx.canvas?.parentElement) {
    ctx.canvas.parentElement.removeChild(ctx.canvas);
  }
  ctx.canvas = null;
  ctx.movie?.dispatchEvent(new CustomEvent("stopMovie", { detail: {} }));
}