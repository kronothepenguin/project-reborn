// Score live-binding slot (004, R5)
//
// Own module so `MovieObject` (engine/core) can read the active context's
// Score WITHOUT importing `singletons.js` (which imports MovieObject — a
// module cycle). This module imports only the Score subsystem.
//
// `singletons.js` re-exports `_score` from here (same live binding) and wires
// `_setScore`/`_resetScore` into `_installSingletons`/`_resetSingletons`.

import { Score } from "./score.js";

export let _score = new Score();

export function _setScore(score) {
  _score = score;
}

export function _resetScore() {
  _score = new Score();
}