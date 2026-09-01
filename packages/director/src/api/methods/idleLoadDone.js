import { _movie } from "../../engine/subsystem/singletons.js";

export function idleLoadDone(intLoadTag) {
  return _movie.idleLoadDone(intLoadTag);
}
