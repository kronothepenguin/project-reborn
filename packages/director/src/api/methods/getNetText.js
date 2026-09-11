// @owner net
// getNetText(url, propertyList?, serverOSString?, characterSet?)
// Per docs/drmx2004_scripting_ref.txt lines 17308-17368.
// 011: delegates to the active context's NetLingo object (the net owner —
// the fetch + state logic lives on NetLingoObject).

import { _getNetLingo } from "../../engine/subsystem/singletons.js";

export function getNetText(url, propertyList, serverOSString, characterSet) {
  return _getNetLingo().getNetText(url, propertyList, serverOSString, characterSet);
}