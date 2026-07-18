// Test shims: environment polyfills installed before any test file runs.
// Wired into vitest.config.js `test.setupFiles`. jsdom lacks Worker,
// OffscreenCanvas (incl. HTMLCanvasElement.transferControlToOffscreen), and
// AudioContext (esp. inside a Worker scope) — these provide minimal surfaces so
// the runtime/player, custom-elements, and Sound* tests can exercise wiring
// deterministically without a real browser (research.md R1/R6/R8).

import { installWorkerShim } from "./worker-shim.js";
import { installOffscreenCanvasShim } from "./offscreen-canvas-shim.js";
import { installAudioContextShim } from "./audio-context-shim.js";

installWorkerShim(globalThis);
installOffscreenCanvasShim(globalThis);
installAudioContextShim(globalThis);