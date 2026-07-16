// Director browser - public host integration layer
// Wires a `DirectorContext` to the DOM (custom elements + canvas + event loop)
// and exposes the high-level builder API (`movie()`, `cast()`, `defineMovie`,
// `defineCast`) for assembling a Director movie in JS.
//
// `createContext()` is the entry point for any consumer that wants to run a
// Director movie in the browser (or in a worker). It instantiates a
// `DirectorContext` and activates it, swapping the module-level singleton slots
// so any translated Lingo code that imports `_movie` / `_player` / etc. sees
// this context's instances.

import { DirectorContext } from "../runtime/context.js";
import { _installSingletons, _resetSingletons } from "../runtime/singletons.js";
import { registerCustomElements, _createMovie } from "../runtime/player/custom-elements/index.js";

export { registerCustomElements, _createMovie };

// Creators (chained builder API)
export { movie } from "../runtime/creators/movie.js";
export { cast } from "../runtime/creators/cast.js";
export { defineMovie } from "../runtime/creators/define-movie.js";
export { defineCast } from "../runtime/creators/define-cast.js";

/**
 * Create and activate a `DirectorContext`.
 *
 * @param {object} [options]
 * @param {string} [options.name]      Movie name.
 * @param {string} [options.src]      Movie source URL.
 * @param {number} [options.tempo]    Frame tempo (fps).
 * @param {number} [options.width]    Stage width.
 * @param {number} [options.height]   Stage height.
 * @param {"auto"|"shim"|boolean} [options.worker="auto"]
 *   - "auto"/true: spin a Web Worker for per-movie isolation (one worker per
 *     context).
 *   - false/"shim": run on the main thread. Useful for tests; requires explicit
 *     `activate()` switching if multiple contexts coexist on the main thread.
 * @returns {DirectorContext}
 */
export function createContext(options = {}) {
  const ctx = new DirectorContext(options);
  ctx.activate();

  // Worker wiring is handled in `runtime/player/worker-host.js` (real worker)
  // or `runtime/player/worker-shim.js` (main-thread fallback). The choice is
  // made by the consumer via `options.worker`; the default is "shim" until the
  // worker host lands. When wired, `ctx.eventLoopHandle` will hold the handle.
  if (options.worker === "auto" || options.worker === true) {
    // TODO: spin a real worker via worker-host.js (see plan Step 8).
    // For now behave like `worker: false`.
  }

  return ctx;
}

/**
 * Tear down a previously-created `DirectorContext`.
 * Stops the event loop and clears canvas/event-loop handles on the context.
 * The singleton slots remain pointing at `ctx` until another `activate()`
 * replaces them (or you call `resetSingletons()`).
 */
export function destroyContext(ctx) {
  if (!ctx || ctx.destroyed) return;
  ctx.destroy();
}

/**
 * Reset the singleton slots back to fresh default instances.
 * Mainly useful for tests that don't construct a `DirectorContext` and want
 * the original default instances restored.
 */
export function resetSingletons() {
  _resetSingletons();
}