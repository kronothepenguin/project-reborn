// @owner net
// downloadNetThing(url, localFile)
// Per docs/drmx2004_scripting_ref.txt lines 15301-15333.
// Director movies in authoring mode and projectors support the
// downLoadNetThing command, but the Shockwave Player does not. The local
// file write step is a no-op in the browser (no filesystem).
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function downloadNetThing(url, localFile) {
  return _getNetLingo().downloadNetThing(url, localFile);
}