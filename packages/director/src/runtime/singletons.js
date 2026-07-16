// Singleton slots
// Single live binding per singleton for the entire module graph of this worker.
// `DirectorContext.activate()` rewrites these slots via `_installSingletons(ctx)`,
// so any module that imports `_movie` / `_player` / etc. sees the active context's
// instances. Each worker has its own module graph → its own slot bindings → full
// per-movie isolation. Default instances keep tests and the no-context case working.

import { MovieObject } from "./objects/movie.js";
import { PlayerObject } from "./objects/player.js";
import { SoundObject } from "./objects/sound.js";
import { KeyObject } from "./objects/key.js";
import { MouseObject } from "./objects/mouse.js";
import { SystemObject } from "./objects/system.js";
import { createGlobalProxy } from "./objects/global.js";

export let _movie = new MovieObject();
export let _player = new PlayerObject();
export let _sound = new SoundObject();
export let _key = new KeyObject();
export let _mouse = new MouseObject();
export let _system = new SystemObject();
export let _global = createGlobalProxy();

export function _installSingletons(ctx) {
  _movie = ctx.movie;
  _player = ctx.player;
  _sound = ctx.sound;
  _key = ctx.key;
  _mouse = ctx.mouse;
  _system = ctx.system;
  _global = ctx.global;
}

export function _resetSingletons() {
  _movie = new MovieObject();
  _player = new PlayerObject();
  _sound = new SoundObject();
  _key = new KeyObject();
  _mouse = new MouseObject();
  _system = new SystemObject();
  _global = createGlobalProxy();
}