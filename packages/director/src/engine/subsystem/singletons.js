// Singleton facade (006 C8 retirement).
//
// The 7 Director core-object instances no longer live as mutable module-level
// slots rewritten by `_installSingletons`. They are consts ON the active
// `DirectorContext` (the global state per the user's directive). This module
// keeps the public names `_movie`/`_player`/`_sound`/`_key`/`_mouse`/`_system`/
// `_global` importable (API barrel + the-proxy + translated Lingo code) by
// resolving them to the active context's instances at read time.
//
// No context active -> fresh default instance per read, keeping no-context
// reads and tests working.
import { getActiveDirectorContext } from "./accessor.js";
import { MovieObject } from "../core/movie.js";
import { PlayerObject } from "../core/player.js";
import { SoundObject } from "../core/sound.js";
import { KeyObject } from "../core/key.js";
import { MouseObject } from "../core/mouse.js";
import { SystemObject } from "../core/system.js";
import { GlobalObject } from "../core/global.js";
import { NetState } from "./net-state.js";

// Internal subsystem slot (004): the Score is owned by the active context
// (C8); the proxy and MovieObject resolve it via the accessor. NOT a
// singleton; never installed on globalThis.

const _defaults = {
  movie: new MovieObject(),
  player: new PlayerObject(),
  sound: new SoundObject(),
  key: new KeyObject(),
  mouse: new MouseObject(),
  system: new SystemObject(),
  global: new GlobalObject(),
};

function resolve(name) {
  const ctx = getActiveDirectorContext();
  return ctx ? ctx[name] : _defaults[name];
}

export function _getMovie() {
  return resolve("movie");
}
export function _getPlayer() {
  return resolve("player");
}
export function _getSound() {
  return resolve("sound");
}
export function _getKey() {
  return resolve("key");
}
export function _getMouse() {
  return resolve("mouse");
}
export function _getSystem() {
  return resolve("system");
}
export function _getGlobal() {
  return resolve("global");
}

const _defaultNetState = new NetState();

// 006 R9: the network registry is a subsystem — the active context's
// `netState`, or a module-scoped default when no context is active.
export function _getNetState() {
  const ctx = getActiveDirectorContext();
  return ctx ? ctx.netState : _defaultNetState;
}

export { _getMovie as _movie, _getPlayer as _player, _getSound as _sound, _getKey as _key, _getMouse as _mouse, _getSystem as _system, _getGlobal as _global };