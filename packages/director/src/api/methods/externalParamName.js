// @owner player
import { _getPlayer } from "../../engine/subsystem/singletons.js";

export function externalParamName(paramNameOrNum) {
  return _getPlayer().externalParamName(paramNameOrNum);
}
