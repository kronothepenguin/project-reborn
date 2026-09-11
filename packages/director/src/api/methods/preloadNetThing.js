// @owner net
// preloadNetThing(url)
// Per docs/drmx2004_scripting_ref.txt lines 24153-24190.
// Preloads a file from the Internet into the browser cache so the
// current movie continues to play while the file is fetched.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function preloadNetThing(url) {
  return _getNetLingo().preloadNetThing(url);
}