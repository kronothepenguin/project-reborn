import { _movie } from "../core/index.js";

export function castLib(castNameOrNum) {
  return _movie.castLib[castNameOrNum] ?? null;
}
