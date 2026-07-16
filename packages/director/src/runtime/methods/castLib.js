import { _movie } from "../singletons.js";

export function castLib(castNameOrNum) {
  return _movie.castLib[castNameOrNum] ?? null;
}
