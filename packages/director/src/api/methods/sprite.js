import { _movie } from "../../engine/subsystem/singletons.js";

export function sprite(nameOrNum) {
  return _movie.sprite[nameOrNum] ?? null;
}
