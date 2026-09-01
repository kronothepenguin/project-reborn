import { _player } from "../../engine/subsystem/singletons.js";

export function externalParamValue(paramNameOrNum) {
  return _player.externalParamValue(paramNameOrNum);
}
