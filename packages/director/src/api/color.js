import { color as makeColor, Color } from "../core/index.js";

export function color(arg, g, b) {
  if (arguments.length === 1) {
    const n = Math.trunc(arg);
    const clamped = n < 0 ? 0 : n > 255 ? 255 : n;
    return new Color(clamped, clamped, clamped);
  }
  return makeColor(arg, g, b);
}
