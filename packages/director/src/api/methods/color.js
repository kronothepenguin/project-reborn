// @owner creator
// color(...) — top-level creator method (006 C6).
//
// The creators live in api/methods (method layer over the engine/base types).
// color() with a single int arg = 8-bit palette index form (0–255, truncated);
// with 3 args = RGB form. Both coordinate with engine/base/color.js (which
// owns the Color class, clamping, and the built-in palettes).
import { color as baseColor } from "../../engine/base/color.js";

export function color(arg, g, b) {
  return baseColor(arg, g, b);
}