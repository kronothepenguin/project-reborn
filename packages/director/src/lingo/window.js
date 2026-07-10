// `window` Lingo factory: window("Sun") returns a WindowObject from the registry,
// or null when the named window is not registered (MX 2004 note).
import { WindowObject } from "../core/window-object.js";

export function window(name) {
  if (typeof name === "string" && name.length > 0) {
    return WindowObject.window[name] ?? null;
  }
  return null;
}
