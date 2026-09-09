// Worker shim — main-thread fallback for `worker: false` or environments
// without Worker support (jsdom, tests). Behaves like `WorkerHost` but runs
// synchronously in the current thread: instantiates a `DirectorContext`,
// activates it, and executes the same method calls the worker host would.
//
// Because methods read the active context's singletons (see
// `runtime/singletons.js`), the shim is functionally equivalent to a worker
// for any single active context. Multiple simultaneous shim contexts need
// explicit `ctx.activate()` switching, since they share the module's singleton
// slots.
//
// 008 C1: `installGlobals(sandbox)` installs the Director API surface as
// FROZEN GETTERS on a provided sandbox (the worker `globalThis` in the host
// path, the test sandbox here). Each name resolves through the singleton
// facade (`_getMovie()` etc.) / the `the` proxy / the api barrel, so translated
// scripts can read `_movie`, `the`, `go`, … as globals WITHOUT mutable slots
// or globalThis writes on activate.

import { DirectorContext } from "../engine/subsystem/context.js";
import { the } from "../engine/syntax/the-proxy.js";
import * as api from "../api/index.js";
import {
  _getMovie,
  _getPlayer,
  _getSound,
  _getKey,
  _getMouse,
  _getSystem,
  _getGlobal,
} from "../engine/subsystem/singletons.js";

const SINGLETON_GETTERS = {
  _movie: _getMovie,
  _player: _getPlayer,
  _sound: _getSound,
  _key: _getKey,
  _mouse: _getMouse,
  _system: _getSystem,
  _global: _getGlobal,
};

export function installGlobals(sandbox) {
  for (const [name, getter] of Object.entries(SINGLETON_GETTERS)) {
    if (!(name in sandbox)) {
      Object.defineProperty(sandbox, name, {
        get: getter,
        configurable: false,
        enumerable: true,
      });
    }
  }
  if (!("the" in sandbox)) {
    Object.defineProperty(sandbox, "the", {
      get: () => the,
      configurable: false,
      enumerable: true,
    });
  }
  for (const [name, fn] of Object.entries(api)) {
    if (typeof fn !== "function") continue;
    if (name in sandbox) continue;
    Object.defineProperty(sandbox, name, {
      get: () => fn,
      configurable: false,
      enumerable: true,
    });
  }
}

export class WorkerShim {
  constructor(options = {}) {
    this._options = options;
    this._ctx = null;
  }

  async bootstrap(params) {
    this._ctx = new DirectorContext({ ...this._options, ...params });
    this._ctx.activate();
    return this._ctx;
  }

  post(method, params) {
    // In the shim, methods are synchronous functions imported directly from
    // the runtime; the dispatch happens inline. The host application reaches
    // them via the lingo barrel or by importing the relevant method module.
    return Promise.resolve({ method, params });
  }

  terminate() {
    if (this._ctx) {
      this._ctx.destroy();
      this._ctx = null;
    }
  }

  get context() {
    return this._ctx;
  }
}