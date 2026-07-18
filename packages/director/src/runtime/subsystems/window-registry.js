// WindowRegistry subsystem (FR-005/FR-036)
//
// Per `DirectorContext`-instance registry that replaces the AI-style static
// `WindowObject.window`/`windowList`/`#windowsByName` registries (per
// refactor.md and FR-005 — no statics on classes). One registry per context.
//
// Surface (per data-model.md / refactor.md `WindowRegistry`):
//   - `register(win)`       — add a `WindowObject` (keyed by name)
//   - `unregister(win)`     — drop a `WindowObject`
//   - `lookup(name)`        — return the registered window by name (or `null`)
//   - `list()`              — snapshot of windows in z-order (front-to-back)
//   - `moveToFront(win)`    — push `win` to the front of the z-order list
//   - `moveToBack(win)`     — push `win` to the back of the z-order list
//   - `reset()`             — drop everything (used by `DirectorContext.activate()`)
//
// `frontWindow()` returns the front of the z-order (or `null`); this is what
// `PlayerObject.frontWindow` reads (per refactor.md "frontWindow returns the
// active/stage window or null in v1 — MIAW deferred per FR-036").

export class WindowRegistry {
  constructor() {
    this._byName = new Map();
    this._order = [];
  }

  register(win) {
    if (!win) return win;
    if (!this._order.includes(win)) this._order.push(win);
    if (win.name) this._byName.set(win.name, win);
    return win;
  }

  unregister(win) {
    const idx = this._order.indexOf(win);
    if (idx !== -1) this._order.splice(idx, 1);
    if (win && win.name && this._byName.get(win.name) === win) {
      this._byName.delete(win.name);
    }
    return win;
  }

  lookup(name) {
    return this._byName.get(name) ?? null;
  }

  list() {
    return this._order.slice();
  }

  frontWindow() {
    return this._order.length > 0 ? this._order[this._order.length - 1] : null;
  }

  moveToFront(win) {
    const idx = this._order.indexOf(win);
    if (idx !== -1) {
      this._order.splice(idx, 1);
      this._order.push(win);
    }
  }

  moveToBack(win) {
    const idx = this._order.indexOf(win);
    if (idx !== -1) {
      this._order.splice(idx, 1);
      this._order.unshift(win);
    }
  }

  reset() {
    this._byName.clear();
    this._order = [];
  }
}