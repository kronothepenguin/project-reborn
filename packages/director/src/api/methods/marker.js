import { _movie } from "../../engine/subsystem/singletons.js";

export function marker(markerNameOrNum) {
  return _movie.marker(markerNameOrNum);
}
