import { _movie } from "../../engine/subsystem/singletons.js";

export function castLib(castNameOrNum) {
  return _movie.castLib[castNameOrNum] ?? null;
}
