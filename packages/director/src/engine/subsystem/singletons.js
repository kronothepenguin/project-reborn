// Singleton slots
//
// Single live binding per singleton for the entire module graph of this worker.
// `DirectorContext.activate()` rewrites these slots via `_installSingletons(ctx)`,
// so any module that imports `_movie` / `_player` / etc. sees the active
// context's instances. Each worker has its own module graph → its own slot
// bindings → full per-movie isolation. Default instances keep tests and the
// no-context case working.
//
// FR-003/FR-016/FR-027; research.md R3.

import { MovieObject } from "../core/movie.js";
import { PlayerObject } from "../core/player.js";
import { SoundObject } from "../core/sound.js";
import { KeyObject } from "../core/key.js";
import { MouseObject } from "../core/mouse.js";
import { SystemObject } from "../core/system.js";
import { GlobalObject } from "../core/global.js";

// Internal subsystem slot (004): re-exported from score-slot.js (which owns
// the binding) so MovieObject can read it without a module cycle. NOT a
// globalThis singleton — only the 7 documented singletons are installed there.
export { _score } from "./score-slot.js";
import { _setScore, _resetScore } from "./score-slot.js";

export let _movie = new MovieObject();
export let _player = new PlayerObject();
export let _sound = new SoundObject();
export let _key = new KeyObject();
export let _mouse = new MouseObject();
export let _system = new SystemObject();
export let _global = new GlobalObject();

export function _installSingletons(ctx) {
  _movie = ctx.movie;
  _player = ctx.player;
  _sound = ctx.sound;
  _key = ctx.key;
  _mouse = ctx.mouse;
  _system = ctx.system;
  _global = ctx.global;
  _setScore(ctx.score);
}

export function _resetSingletons() {
  _movie = new MovieObject();
  _player = new PlayerObject();
  _sound = new SoundObject();
  _key = new KeyObject();
  _mouse = new MouseObject();
  _system = new SystemObject();
  _global = new GlobalObject();
  _resetScore();
}