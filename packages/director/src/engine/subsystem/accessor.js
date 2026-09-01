// Active DirectorContext accessor (006 C8).
//
// The 7 core-object instances (movie, player, sound, key, mouse, system,
// global) live as consts ON the DirectorContext — they ARE the global state,
// not module-level singleton slots. This module keeps a single pointer to the
// context that is currently active (the last `activate()`), and lets the `the`
// proxy, the api methods, and the browser layer read the context's instances
// through ONE accessor. No globalThis installs, no mutable per-singleton
// bindings; each worker has its own module graph → its own active context.

let _activeContext = null;

export function getActiveDirectorContext() {
  return _activeContext;
}

export function setActiveDirectorContext(ctx) {
  _activeContext = ctx;
}