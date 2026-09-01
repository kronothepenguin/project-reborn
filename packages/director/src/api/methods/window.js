// @owner window
// `window` Lingo factory: returns the registered WindowObject for a name, or null when the
// named window is not registered. MX 2004 note: a reference to that window is created only
// if a window by that name exists; otherwise the reference contains VOID (Lingo) or null
// (JavaScript syntax). v1 stub returns null per documented default — see refactor.md
// (methods/window.js).

export function window(name) {
  if (typeof name !== "string" || name.length === 0) {
    return null;
  }
  // TODO(subsystems): route through WindowRegistry to look up the registered window
  return null;
}