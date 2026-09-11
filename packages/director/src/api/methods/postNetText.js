// @owner net
// postNetText(url, propertyListOrText, serverOSString?, serverCharSetString?)
// Per docs/drmx2004_scripting_ref.txt lines 23877-23943.
// 011: delegates to the active context's NetLingo object (the net owner).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function postNetText(url, propertyListOrText, serverOSString, serverCharSetString) {
  return _getNetLingo().postNetText(url, propertyListOrText, serverOSString, serverCharSetString);
}