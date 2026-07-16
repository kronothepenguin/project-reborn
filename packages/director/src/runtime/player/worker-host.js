// Worker host — runs a Director movie in a real Web Worker for per-movie
// isolation of the singleton slots. Each worker has its own module graph →
// its own `runtime/singletons.js` slot bindings → no cross-movie
// interference. The main thread posts a bootstrap message with the movie
// descriptor and asset URLs; the worker spins a `DirectorContext`, activates
// it, loads casts, and starts the event loop.
//
// The worker entrypoint must import `@project-reborn/director/worker` (or its
// own equivalent that calls `createContext()`). For now this file exposes the
// host-side API: a `WorkerHost` class that owns the worker, the message port,
// and a queue of pending RPC ids. The actual worker source URL is supplied by
// the consumer (or the build, via Vite's `?worker` import).

export class WorkerHost {
  constructor({ workerUrl, name = "" } = {}) {
    if (typeof Worker === "undefined") {
      throw new Error("WorkerHost requires a Worker global (browser environment).");
    }
    this._name = name;
    this._worker = new Worker(workerUrl, { type: "module", name });
    this._pending = new Map();
    this._nextId = 1;
    this._worker.addEventListener("message", this._onMessage.bind(this));
  }

  _onMessage(e) {
    const { id, result, error, event } = e.data ?? {};
    if (id && this._pending.has(id)) {
      const { resolve, reject } = this._pending.get(id);
      this._pending.delete(id);
      if (error) reject(new Error(error));
      else resolve(result);
      return;
    }
    if (event) {
      this.dispatchEvent(new CustomEvent(event, { detail: e.data.detail }));
    }
  }

  post(method, params) {
    return new Promise((resolve, reject) => {
      const id = this._nextId++;
      this._pending.set(id, { resolve, reject });
      this._worker.postMessage({ id, method, params });
    });
  }

  terminate() {
    this._worker.terminate();
    this._pending.clear();
  }
}