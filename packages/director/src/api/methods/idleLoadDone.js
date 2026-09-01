// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function idleLoadDone(intLoadTag) {
  return _getMovie().idleLoadDone(intLoadTag);
}
