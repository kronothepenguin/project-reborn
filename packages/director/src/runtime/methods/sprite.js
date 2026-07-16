import { _movie } from "../singletons.js";

export function sprite(nameOrNum) {
  return _movie.sprite[nameOrNum] ?? null;
}
