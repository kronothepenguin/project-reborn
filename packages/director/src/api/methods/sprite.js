// @owner sprite
// sprite(nameOrNum) → live SpriteObject for the current frame's channel
// (003 T003). Resolves through the active context's sprite path — never the
// stale `movie.sprite` map. Channel 0 = stage; unpopulated channels → null.

import { _getMovie } from "../../engine/subsystem/singletons.js";
import { getActiveDirectorContext } from "../../engine/subsystem/accessor.js";

export function sprite(nameOrNum) {
  const ctx = getActiveDirectorContext();
  if (!ctx) return null;
  const n = Number(nameOrNum);

  if (!Number.isFinite(n) || n < 0) {
    // Sprite names are not part of the 004 cell model; numeric channels are
    // canonical (power-of-two lookup by name is 003-later / member lookup).
    return null;
  }

  return ctx.sprite(n);
}
