// @owner top
// xtra(xtraName) — creates a scripting Xtra object (011).
// Documented creation form: `new xtra("fileio")` (scripting_objects.txt).
// With `new`, the returned object becomes the result; called without `new` it
// also returns the instance. Unknown Xtra names → null.

import { XTRA_CLASSES } from "../../engine/core/scripting/index.js";

export function xtra(xtraName) {
  if (typeof xtraName !== "string") return null;
  const Cls = XTRA_CLASSES[xtraName.toLowerCase()] ?? null;
  return Cls ? new Cls() : null;
}