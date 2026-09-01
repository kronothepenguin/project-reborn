// @owner sprite
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function sprite(nameOrNum) {
  return _getMovie().sprite[nameOrNum] ?? null;
}
