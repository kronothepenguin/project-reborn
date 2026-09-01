// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function externalParamValue(paramNameOrNum) {
  return _getPlayer().externalParamValue(paramNameOrNum);
}
