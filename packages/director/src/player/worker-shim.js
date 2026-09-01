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

import { DirectorContext } from "../engine/subsystem/context.js";

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