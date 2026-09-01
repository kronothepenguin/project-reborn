// @owner movie
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function marker(markerNameOrNum) {
  return _getMovie().marker(markerNameOrNum);
}
