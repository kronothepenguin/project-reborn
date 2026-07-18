// Test shim: minimal Web Worker mock for vitest/jsdom (research.md R1).
// Models a Worker as an in-process EventTarget mirroring `postMessage`/`onmessage`
// so worker-host/event-loop/custom-element tests can run without a real browser.

export class MockWorker extends EventTarget {
  constructor(urlOrUrlObj, options) {
    super();
    this.url = urlOrUrlObj instanceof URL ? urlOrUrlObj.href : String(urlOrUrlObj ?? "");
    this.options = options ?? {};
    this.onmessage = null;
    this.onerror = null;
    this._terminated = false;
    // The "worker-side" listener bag — tests/scripts inside the worker register
    // handlers via `self.onmessage = ...` / `self.addEventListener("message", ...)`.
    this._inside = new MockWorkerGlobal(this);
    // Mirror posts from inside the worker out to the main-thread `onmessage`.
    this._inside.addEventListener("message", (ev) => {
      if (typeof this.onmessage === "function") this.onmessage(ev);
      this.dispatchEvent(new MessageEvent("message", { data: ev.data }));
    });
    this._inside.addEventListener("error", (ev) => {
      if (typeof this.onerror === "function") this.onerror(ev);
    });
  }

  postMessage(data, transfer) {
    if (this._terminated) return;
    this._inside.dispatchEvent(new MessageEvent("message", { data }));
  }

  postMessageFromWorker(data) {
    this._inside.dispatchEventOut(new MessageEvent("message", { data }));
  }

  addEventListener(type, listener, opts) {
    super.addEventListener(type, listener, opts);
  }

  terminate() {
    this._terminated = true;
    this._inside._terminated = true;
  }
}

// The `self`/`globalThis` surface exposed to code running "inside" the worker.
export class MockWorkerGlobal extends EventTarget {
  constructor(owner) {
    super();
    this._owner = owner;
    this._terminated = false;
    this.onmessage = null;
    this.postMessage = (data) => {
      if (this._terminated) return;
      this.dispatchEventOut(new MessageEvent("message", { data }));
    };
    this.close = () => {
      this._terminated = true;
    };
  }

  addEventListener(type, listener, opts) {
    super.addEventListener(type, listener, opts);
    if (type === "message" && typeof listener === "function") {
      this.onmessage = listener;
    }
  }

  // Dispatch an inbound message (from main thread) into the worker scope.
  dispatchEventIn(ev) {
    super.dispatchEvent(ev);
    if (ev.type === "message" && typeof this.onmessage === "function") this.onmessage(ev);
  }

  // Dispatch an outbound message (from worker → main thread).
  dispatchEventOut(ev) {
    this.dispatchEvent(new Event(`__out_${ev.type}`));
    // forward to owner's main-thread listeners
    if (this._owner) this._owner.dispatchEvent(ev);
  }
}

export function installWorkerShim(target = globalThis) {
  if (!target.Worker || target.Worker.__isMock) {
    target.Worker = MockWorker;
    target.Worker.__isMock = true;
  }
  return target.Worker;
}