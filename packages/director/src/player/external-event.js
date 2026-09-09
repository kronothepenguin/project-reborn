// external-event bridge (008 R9/US5) — worker → host.
//
// `externalEvent(name, ...args)` posts a tagged message to the main thread
// ({kind:"externalEvent", name, args}); the imperative handle re-dispatches it
// as a DOM `CustomEvent("externalEvent", {detail:{name,args}})` (the
// declarative path re-dispatches on the custom element — 009).
//
// The post target is installed by the worker-shim at bootstrap (the worker's
// `postMessage` to the host). Outside a worker (tests, main-thread shim) a
// global pointer can be set by the host for observation.

let _post = null;

export function _setExternalEventPost(fn) {
  _post = fn;
}

export function externalEvent(name, ...args) {
  if (typeof _post === "function") {
    _post({ kind: "externalEvent", name, args });
  }
}