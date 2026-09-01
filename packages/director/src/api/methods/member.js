import { _movie } from "../../engine/subsystem/singletons.js";

export function member(id, castLibNum) {
  if (typeof id === "string" && (castLibNum === undefined || castLibNum === null)) {
    for (let i = 1; i <= Number.MAX_SAFE_INTEGER; i++) {
      const lib = _movie.castLib[i];
      if (!lib) break;
      const found = lib.member[id];
      if (found) return found;
    }
    return null;
  }

  const libNum = castLibNum ?? 1;
  const lib = _movie.castLib[libNum];
  if (!lib) return null;
  return lib.member[id] ?? null;
}
