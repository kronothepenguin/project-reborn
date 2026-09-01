// @owner member
import { _getMovie } from "../../engine/subsystem/singletons.js";

export function member(id, castLibNum) {
  if (typeof id === "string" && (castLibNum === undefined || castLibNum === null)) {
    for (let i = 1; i <= Number.MAX_SAFE_INTEGER; i++) {
      const lib = _getMovie().castLib[i];
      if (!lib) break;
      const found = lib.member[id];
      if (found) return found;
    }
    return null;
  }

  const libNum = castLibNum ?? 1;
  const lib = _getMovie().castLib[libNum];
  if (!lib) return null;
  return lib.member[id] ?? null;
}
