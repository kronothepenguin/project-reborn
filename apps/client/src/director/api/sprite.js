import { _movie } from "../core/index.js";

export function sprite(nameOrNum) {
  return _movie.sprite[nameOrNum] ?? null;
}
