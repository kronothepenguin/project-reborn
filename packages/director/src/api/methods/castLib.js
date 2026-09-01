// @owner castLib
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function castLib(castNameOrNum) {
  return _getMovie().castLib[castNameOrNum] ?? null;
}
