import { rect as makeRect } from "../../engine/base/rect.js";

export function rect(intLeft, intTop, intRight, intBottom) {
  return makeRect(intLeft, intTop, intRight, intBottom);
}
